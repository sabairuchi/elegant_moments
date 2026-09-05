import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page,
        limit: 10,
        search,
        role: roleFilter,
        status: statusFilter
      });

      const response = await fetch(`/api/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        throw new Error(data.message || 'Error fetching users');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, roleFilter, statusFilter, token]);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditStatus(user.accountStatus);
    setActionError('');
    setActionSuccess('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');
    setUpdating(true);

    try {
      // Update Role if changed
      if (editRole !== editingUser.role) {
        const roleRes = await fetch(`/api/users/${editingUser.id}/role`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ role: editRole })
        });
        const roleData = await roleRes.json();
        if (!roleRes.ok) throw new Error(roleData.message || 'Failed to update role');
      }

      // Update Status if changed
      if (editStatus !== editingUser.accountStatus) {
        const statusRes = await fetch(`/api/users/${editingUser.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: editStatus })
        });
        const statusData = await statusRes.json();
        if (!statusRes.ok) throw new Error(statusData.message || 'Failed to update status');
      }

      setActionSuccess('User updated successfully.');
      setTimeout(() => {
        setEditingUser(null);
        fetchUsers();
      }, 1500);

    } catch (err) {
      setActionError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const renderStatusBadge = (status) => {
    let bg = '#eee';
    let color = '#333';
    switch(status) {
      case 'ACTIVE': bg = '#DCFCE7'; color = '#166534'; break;
      case 'INACTIVE': bg = '#F3F4F6'; color = '#4B5563'; break;
      case 'SUSPENDED': bg = '#FEE2E2'; color = '#991B1B'; break;
      case 'PENDING_VERIFICATION': bg = '#FEF3C7'; color = '#92400E'; break;
      default: bg = '#F3E8FF'; color = '#6B21A8'; break;
    }
    return (
      <span style={{ backgroundColor: bg, color, padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
        {status}
      </span>
    );
  };

  const renderRoleBadge = (role) => {
    let bg = '#E0F2FE';
    let color = '#0369A1';
    if (role === 'super_admin' || role === 'admin') {
      bg = '#FCE7F3';
      color = '#9D174D';
    } else if (role === 'vendor' || role === 'planner') {
      bg = '#Fef3c7';
      color = '#92400e';
    }
    return (
      <span style={{ backgroundColor: bg, color, padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
        {role}
      </span>
    );
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '2.5rem', marginBottom: '20px' }}>
        User Management
      </h1>

      {error && (
        <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>Search</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 15px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
          />
        </div>
        <div style={{ minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ width: '100%', padding: '10px 15px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
          >
            <option value="All">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="planner">Planner</option>
            <option value="vendor">Vendor</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div style={{ minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '10px 15px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem' }}
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-ivory)', borderBottom: '2px solid var(--color-gold)' }}>
                <th style={{ padding: '15px', textAlign: 'left', color: 'var(--color-espresso)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>User</th>
                <th style={{ padding: '15px', textAlign: 'left', color: 'var(--color-espresso)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Role</th>
                <th style={{ padding: '15px', textAlign: 'left', color: 'var(--color-espresso)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'right', color: 'var(--color-espresso)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-burgundy)' }}>{user.firstName} {user.lastName}</div>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>{user.email}</div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      {renderRoleBadge(user.role)}
                    </td>
                    <td style={{ padding: '15px' }}>
                      {renderStatusBadge(user.accountStatus)}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleEditClick(user)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div style={{ backgroundColor: 'var(--color-ivory)', padding: '15px 20px', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Page <span style={{ fontWeight: '600', color: 'var(--color-espresso)' }}>{page}</span> of <span style={{ fontWeight: '600', color: 'var(--color-espresso)' }}>{totalPages || 1}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: page === 1 ? '#f9f9f9' : '#fff', color: page === 1 ? '#aaa' : '#333', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: page >= totalPages ? '#f9f9f9' : '#fff', color: page >= totalPages ? '#aaa' : '#333', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '450px', padding: '30px' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--color-burgundy)', fontSize: '1.5rem', marginBottom: '20px' }}>
              Edit User
            </h2>
            <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#555' }}>
              Updating role and status for <strong>{editingUser.email}</strong>
            </div>
            
            {actionError && <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '15px' }}>{actionError}</div>}
            {actionSuccess && <div style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '15px' }}>{actionSuccess}</div>}

            <form onSubmit={handleUpdate}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>Role</label>
                <select
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="planner">Planner</option>
                  <option value="vendor">Vendor</option>
                  <option value="client">Client</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', marginBottom: '6px', fontWeight: '600' }}>Account Status</label>
                <select
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="PENDING_VERIFICATION">Pending Verification</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn btn-secondary"
                  style={{ padding: '10px 20px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn btn-primary"
                  style={{ padding: '10px 20px' }}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
