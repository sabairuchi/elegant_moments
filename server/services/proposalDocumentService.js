import { proposalService } from './proposalService.js';

export const proposalDocumentService = {
  async generateProposalHTML(proposalId) {
    const proposal = await proposalService.getProposalById(proposalId);
    if (!proposal) {
      const err = new Error('Proposal not found');
      err.statusCode = 404;
      throw err;
    }

    const items = proposal.items || [];

    const formattedDate = new Date(proposal.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const validUntilDate = proposal.validUntil
      ? new Date(proposal.validUntil).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'N/A';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Proposal Quotation - ${proposal.proposalNumber || proposal.id}</title>
        <style>
          body {
            font-family: 'Cinzel', 'Playfair Display', Georgia, serif;
            background-color: #FDFBF7;
            color: #2A1810;
            margin: 0;
            padding: 40px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: #FFFFFF;
            border: 1px solid #E5D5C5;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #D4AF37;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .brand-title {
            font-size: 2rem;
            color: #4A0E17;
            letter-spacing: 3px;
            margin: 0;
          }
          .brand-subtitle {
            font-size: 0.9rem;
            color: #D4AF37;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 5px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            font-size: 0.95rem;
          }
          .meta-box {
            background: #FAF6F0;
            padding: 15px;
            border-left: 3px solid #D4AF37;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background: #4A0E17;
            color: #FDFBF7;
            padding: 12px;
            text-align: left;
            font-weight: 500;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #E5D5C5;
          }
          .totals-table {
            width: 300px;
            margin-left: auto;
            margin-bottom: 30px;
          }
          .totals-table td {
            padding: 8px 12px;
          }
          .grand-total {
            font-weight: bold;
            color: #4A0E17;
            font-size: 1.1rem;
            border-top: 2px solid #D4AF37;
          }
          .footer {
            text-align: center;
            font-size: 0.85rem;
            color: #777;
            border-top: 1px solid #E5D5C5;
            padding-top: 20px;
          }
          @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; border: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="brand-title">ELEGANT MOMENTS</h1>
            <div class="brand-subtitle">Luxury Wedding Planning & Event Curation</div>
          </div>

          <div class="meta-grid">
            <div class="meta-box">
              <strong>Client:</strong> ${proposal.clientName || 'Valued Client'}<br>
              <strong>Wedding:</strong> ${proposal.weddingTitle || 'Celebration'}<br>
              <strong>Status:</strong> ${proposal.status}
            </div>
            <div class="meta-box">
              <strong>Proposal Ref:</strong> ${proposal.proposalNumber || proposal.id}<br>
              <strong>Date:</strong> ${formattedDate}<br>
              <strong>Valid Until:</strong> ${validUntilDate}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Service / Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>\$${Number(item.unitPrice).toLocaleString()}</td>
                  <td>\$${Number(item.subtotal).toLocaleString()}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">\$${Number(proposal.subtotal || proposal.totalAmount).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Tax:</td>
              <td style="text-align: right;">\$${Number(proposal.taxAmount || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Discount:</td>
              <td style="text-align: right;">-\$${Number(proposal.discountAmount || 0).toLocaleString()}</td>
            </tr>
            <tr class="grand-total">
              <td>Total Amount:</td>
              <td style="text-align: right;">\$${Number(proposal.finalAmount || proposal.totalAmount).toLocaleString()}</td>
            </tr>
          </table>

          ${proposal.notes ? `<div style="background: #FAF6F0; padding: 15px; margin-bottom: 30px;"><strong>Notes:</strong> ${proposal.notes}</div>` : ''}

          <div class="footer">
            <p>Thank you for choosing Elegant Moments. For inquiries regarding this quotation, please contact your event director.</p>
            <p>© Elegant Moments Luxury Celebrations. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  },
};
