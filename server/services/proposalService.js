import crypto from 'crypto';
import { query } from '../db/index.js';
import { auditService } from './auditService.js';
import { weddingService } from './weddingService.js';

export const PROPOSAL_STATUSES = ['DRAFT', 'SENT', 'APPROVED', 'CHANGES_REQUESTED', 'REJECTED', 'EXPIRED'];

let memoryProposals = [];

const calculateProposalTotals = (items = [], discountAmount = 0, taxAmount = 0) => {
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice || item.price) || 0;
    item.subtotal = qty * price;
    return sum + item.subtotal;
  }, 0);

  const discount = Number(discountAmount) || 0;
  const tax = Number(taxAmount) || 0;
  const finalAmount = Math.max(0, subtotal + tax - discount);

  return { subtotal, discountAmount: discount, taxAmount: tax, finalAmount };
};

const mapRowToProposal = (row, items = []) => ({
  id: row.id,
  proposalNumber: row.proposal_number || row.proposalNumber,
  weddingId: row.wedding_id || row.weddingId,
  createdByUserId: row.created_by_user_id || row.createdByUserId || null,
  createdByUserEmail: row.created_by_user_email || row.createdByUserEmail || '',
  clientName: row.client_name || row.clientName || '',
  weddingTitle: row.wedding_title || row.weddingTitle || '',
  items: items.length > 0 ? items : (row.items || []),
  subtotal: Number(row.subtotal) || Number(row.total_amount) || 0,
  discountAmount: Number(row.discount_amount || row.discountAmount) || 0,
  taxAmount: Number(row.tax_amount || row.taxAmount) || 0,
  finalAmount: Number(row.final_amount || row.finalAmount || row.total_amount) || 0,
  validUntil: row.valid_until ? new Date(row.valid_until).toISOString().split('T')[0] : null,
  status: row.status || 'DRAFT',
  notes: row.notes || '',
  clientFeedback: row.client_feedback || row.clientFeedback || '',
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
});

class ProposalService {
  async getAllProposals({ weddingId, clientId, plannerId, status, search } = {}) {
    try {
      let sql = 'SELECT p.*, w.wedding_title, w.client_name FROM proposals p LEFT JOIN weddings w ON p.wedding_id = w.id WHERE 1=1';
      const params = [];
      let paramIdx = 1;

      if (weddingId) {
        sql += ` AND p.wedding_id = $${paramIdx++}`;
        params.push(weddingId);
      }
      if (clientId) {
        sql += ` AND w.client_id = $${paramIdx++}`;
        params.push(clientId);
      }
      if (plannerId) {
        sql += ` AND w.assigned_planner_id = $${paramIdx++}`;
        params.push(plannerId);
      }
      if (status) {
        sql += ` AND p.status = $${paramIdx++}`;
        params.push(status);
      }
      if (search) {
        sql += ` AND (LOWER(p.proposal_number) LIKE $${paramIdx} OR LOWER(w.wedding_title) LIKE $${paramIdx})`;
        params.push(`%${search.toLowerCase()}%`);
        paramIdx++;
      }

      sql += ' ORDER BY p.created_at DESC';
      const res = await query(sql, params);

      const proposals = await Promise.all(
        res.rows.map(async (row) => {
          let items = [];
          try {
            const itemRes = await query('SELECT * FROM proposal_items WHERE proposal_id = $1', [row.id]);
            items = itemRes.rows.map(i => ({
              id: i.id,
              serviceId: i.service_id,
              description: i.description,
              quantity: i.quantity,
              unitPrice: Number(i.unit_price),
              subtotal: Number(i.subtotal)
            }));
          } catch {
            items = row.items || [];
          }
          return mapRowToProposal(row, items);
        })
      );

      return { proposals, total: proposals.length };
    } catch (dbErr) {
      let filtered = [...memoryProposals];
      if (weddingId) filtered = filtered.filter(p => p.weddingId === weddingId);
      if (status) filtered = filtered.filter(p => p.status === status);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(p => 
          (p.proposalNumber && p.proposalNumber.toLowerCase().includes(s)) ||
          (p.weddingTitle && p.weddingTitle.toLowerCase().includes(s))
        );
      }
      if (plannerId || clientId) {
        // Retrieve relevant weddings list for memory filtering
        try {
          const { weddings } = await weddingService.getAllWeddings({ plannerId, clientId });
          const allowedWeddingIds = weddings.map(w => w.id);
          filtered = filtered.filter(p => allowedWeddingIds.includes(p.weddingId));
        } catch {
          // If error, filter memory
        }
      }

      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { proposals: filtered, total: filtered.length };
    }
  }

  async getProposalById(id) {
    try {
      const res = await query(
        'SELECT p.*, w.wedding_title, w.client_name FROM proposals p LEFT JOIN weddings w ON p.wedding_id = w.id WHERE p.id = $1',
        [id]
      );
      if (res.rows.length === 0) {
        const err = new Error('Proposal not found');
        err.status = 404;
        throw err;
      }
      let items = [];
      try {
        const itemRes = await query('SELECT * FROM proposal_items WHERE proposal_id = $1', [id]);
        items = itemRes.rows.map(i => ({
          id: i.id,
          serviceId: i.service_id,
          description: i.description,
          quantity: i.quantity,
          unitPrice: Number(i.unit_price),
          subtotal: Number(i.subtotal)
        }));
      } catch {
        items = res.rows[0].items || [];
      }
      return mapRowToProposal(res.rows[0], items);
    } catch (dbErr) {
      if (dbErr.status === 404) throw dbErr;
      const found = memoryProposals.find(p => p.id === id);
      if (!found) {
        const err = new Error('Proposal not found');
        err.status = 404;
        throw err;
      }
      return found;
    }
  }

  async createProposal(proposalData, user = {}) {
    if (!proposalData.weddingId) {
      const err = new Error('weddingId is required for creating a proposal');
      err.status = 400;
      throw err;
    }

    const wedding = await weddingService.getWeddingById(proposalData.weddingId);

    const items = Array.isArray(proposalData.items) ? proposalData.items : [];
    const totals = calculateProposalTotals(items, proposalData.discountAmount, proposalData.taxAmount);

    const id = crypto.randomUUID();
    const proposalNumber = proposalData.proposalNumber || `PROP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const validUntil = proposalData.validUntil || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const status = proposalData.status || 'DRAFT';
    const notes = proposalData.notes || '';
    const now = new Date().toISOString();

    if (!PROPOSAL_STATUSES.includes(status)) {
      const err = new Error(`Invalid status. Must be one of: ${PROPOSAL_STATUSES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const newProposal = {
      id,
      proposalNumber,
      weddingId: proposalData.weddingId,
      weddingTitle: wedding.weddingName || 'Luxury Wedding',
      clientName: wedding.clientName || 'Valued Client',
      createdByUserId: user.id || null,
      createdByUserEmail: user.email || '',
      items,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      finalAmount: totals.finalAmount,
      validUntil,
      status,
      notes,
      clientFeedback: '',
      createdAt: now,
      updatedAt: now
    };

    try {
      const sql = `
        INSERT INTO proposals (id, proposal_number, wedding_id, created_by_user_id, total_amount, discount_amount, tax_amount, final_amount, valid_until, status, notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;
      const params = [
        id, proposalNumber, proposalData.weddingId, user.id || null, totals.subtotal, totals.discountAmount, totals.taxAmount, totals.finalAmount, validUntil, status, notes, now, now
      ];
      await query(sql, params);

      for (const item of items) {
        await query(
          'INSERT INTO proposal_items (id, proposal_id, service_id, description, quantity, unit_price, subtotal) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [crypto.randomUUID(), id, item.serviceId || null, item.description || 'Custom Item', item.quantity || 1, item.unitPrice || 0, item.subtotal || 0]
        );
      }
    } catch (dbErr) {
      memoryProposals.push(newProposal);
    }

    auditService.logAction({
      userId: user.id,
      userEmail: user.email,
      action: 'PROPOSAL_CREATED',
      entityType: 'PROPOSAL',
      entityId: id,
      details: { proposalNumber, weddingId: proposalData.weddingId, finalAmount: totals.finalAmount, status }
    });

    return newProposal;
  }

  async updateProposal(id, updates, user = {}) {
    const existing = await this.getProposalById(id);

    if (updates.status && !PROPOSAL_STATUSES.includes(updates.status)) {
      const err = new Error(`Invalid status. Must be one of: ${PROPOSAL_STATUSES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const items = updates.items !== undefined ? updates.items : existing.items;
    const discountAmount = updates.discountAmount !== undefined ? updates.discountAmount : existing.discountAmount;
    const taxAmount = updates.taxAmount !== undefined ? updates.taxAmount : existing.taxAmount;
    const totals = calculateProposalTotals(items, discountAmount, taxAmount);

    const status = updates.status !== undefined ? updates.status : existing.status;
    const validUntil = updates.validUntil !== undefined ? updates.validUntil : existing.validUntil;
    const notes = updates.notes !== undefined ? updates.notes : existing.notes;
    const clientFeedback = updates.clientFeedback !== undefined ? updates.clientFeedback : existing.clientFeedback;
    const now = new Date().toISOString();

    const updatedProposal = {
      ...existing,
      items,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      finalAmount: totals.finalAmount,
      status,
      validUntil,
      notes,
      clientFeedback,
      updatedAt: now
    };

    try {
      const sql = `
        UPDATE proposals
        SET total_amount = $1, discount_amount = $2, tax_amount = $3, final_amount = $4, status = $5, valid_until = $6, notes = $7, updated_at = $8
        WHERE id = $9
      `;
      await query(sql, [totals.subtotal, totals.discountAmount, totals.taxAmount, totals.finalAmount, status, validUntil, notes, now, id]);
    } catch (dbErr) {
      const idx = memoryProposals.findIndex(p => p.id === id);
      if (idx !== -1) {
        memoryProposals[idx] = updatedProposal;
      }
    }

    auditService.logAction({
      userId: user.id,
      userEmail: user.email,
      action: 'PROPOSAL_UPDATED',
      entityType: 'PROPOSAL',
      entityId: id,
      details: { status, finalAmount: totals.finalAmount }
    });

    return updatedProposal;
  }

  async updateProposalStatus(id, { status, clientFeedback }, user = {}) {
    if (!PROPOSAL_STATUSES.includes(status)) {
      const err = new Error(`Invalid status. Must be one of: ${PROPOSAL_STATUSES.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const updated = await this.updateProposal(id, { status, clientFeedback }, user);

    auditService.logAction({
      userId: user.id,
      userEmail: user.email,
      action: `PROPOSAL_STATUS_${status}`,
      entityType: 'PROPOSAL',
      entityId: id,
      details: { previousStatus: updated.status, newStatus: status, clientFeedback }
    });

    return updated;
  }

  async deleteProposal(id, user = {}) {
    const existing = await this.getProposalById(id);
    try {
      await query('DELETE FROM proposals WHERE id = $1', [id]);
    } catch (dbErr) {
      const idx = memoryProposals.findIndex(p => p.id === id);
      if (idx !== -1) memoryProposals.splice(idx, 1);
    }

    auditService.logAction({
      userId: user.id,
      userEmail: user.email,
      action: 'PROPOSAL_DELETED',
      entityType: 'PROPOSAL',
      entityId: id,
      details: { proposalNumber: existing.proposalNumber }
    });

    return existing;
  }
}

export const proposalService = new ProposalService();
