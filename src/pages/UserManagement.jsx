import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import api from '../services/api';
import { CheckCircle, XCircle, Unlock, Lock, Edit2, Trash2, X } from 'lucide-react';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit State
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: '' });

  // Create State
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', role: 'FLAT_OWNER', password: '' });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (userId, action) => {
    try {
      await api.patch(`/users/${userId}/${action}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} user`);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const startEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({
      name: user.name,
      email: user.email || '',
      phone: user.phone,
      role: user.role
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editingUser}`, editForm);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', createForm);
      setIsCreatingUser(false);
      setCreateForm({ name: '', email: '', phone: '', role: 'FLAT_OWNER', password: '' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  if (loading) return <Loader text="Loading..." />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container glass-panel">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h2>User Management</h2>
            <p>Approve, block, edit, and delete access for all registered users.</p>
          </div>
          <button onClick={() => setIsCreatingUser(true)} className="glass-button">
            Create User
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-email">{user.email || 'No email'}</span>
                  </div>
                </td>
                <td>{user.phone}</td>
                <td><span className={`badge ${user.role === 'SUPER_ADMIN' ? 'danger' : 'info'}`}>{user.role}</span></td>
                <td>
                  <div className="status-badges">
                    {user.isApproved ? (
                      <span className="badge success">Approved</span>
                    ) : (
                      <span className="badge warning">Pending</span>
                    )}
                    {user.isBlocked && <span className="badge danger">Blocked</span>}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    {!user.isApproved && (
                      <button onClick={() => handleAction(user._id, 'approve')} className="icon-btn success" title="Approve">
                        <CheckCircle size={18} />
                      </button>
                    )}
                    
                    {user.isBlocked ? (
                      <button onClick={() => handleAction(user._id, 'unblock')} className="icon-btn success" title="Unblock">
                        <Unlock size={18} />
                      </button>
                    ) : (
                      <button onClick={() => handleAction(user._id, 'block')} className="icon-btn warning" title="Block" disabled={user.role === 'SUPER_ADMIN'}>
                        <Lock size={18} />
                      </button>
                    )}

                    <button onClick={() => startEdit(user)} className="icon-btn info" title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(user._id)} className="icon-btn danger" title="Delete" disabled={user.role === 'SUPER_ADMIN'}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="icon-btn"><X size={20}/></button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input className="glass-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="glass-input" type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="glass-input" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select className="glass-input" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                  <option value="FLAT_OWNER">FLAT_OWNER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="GUARD">GUARD</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
              <button type="submit" className="glass-button full-width">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {isCreatingUser && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Create User</h3>
              <button onClick={() => setIsCreatingUser(false)} className="icon-btn"><X size={20}/></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input className="glass-input" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="glass-input" type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="glass-input" value={createForm.phone} onChange={e => setCreateForm({...createForm, phone: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select className="glass-input" value={createForm.role} onChange={e => setCreateForm({...createForm, role: e.target.value})}>
                  <option value="FLAT_OWNER">FLAT_OWNER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="GUARD">GUARD</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input className="glass-input" type="password" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} required minLength={6} />
              </div>
              <button type="submit" className="glass-button full-width">Create User</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;


