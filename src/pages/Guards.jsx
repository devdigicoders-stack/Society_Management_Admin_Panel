import { useState, useEffect } from 'react';
import api from '../services/api';
import { Edit2, Trash2, X } from 'lucide-react';

const Guards = () => {
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editGuard, setEditGuard] = useState(null);
  const [isCreatingGuard, setIsCreatingGuard] = useState(false);
  const [societies, setSocieties] = useState([]);
  const [formData, setFormData] = useState({ shift: '', gateNumber: '' });
  const [createData, setCreateData] = useState({ name: '', phone: '', password: '', shift: 'MORNING', gateNumber: '', societyId: '' });

  const fetchGuards = async () => {
    try {
      const response = await api.get('/guards/');
      if (response.data.success) {
        setGuards(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch guards');
    } finally {
      setLoading(false);
    }
  };

  const fetchSocieties = async () => {
    try {
      const response = await api.get('/societies');
      if (response.data.success) {
        setSocieties(response.data.data);
        if (response.data.data.length > 0) {
          setCreateData(prev => ({ ...prev, societyId: response.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch societies', err);
    }
  };

  useEffect(() => {
    fetchGuards();
    fetchSocieties();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this guard? Their user account will also be deleted.")) return;
    try {
      const res = await api.delete(`/guards/${id}`);
      if (res.data.success) {
        setGuards(guards.filter(g => g._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete guard');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/guards/${editGuard._id}`, formData);
      if (res.data.success) {
        setGuards(guards.map(g => g._id === editGuard._id ? res.data.data : g));
        setEditGuard(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update guard');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/guards/admin`, createData);
      if (res.data.success) {
        setGuards([res.data.data, ...guards]);
        setIsCreatingGuard(false);
        setCreateData({ name: '', phone: '', password: '', shift: 'MORNING', gateNumber: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create guard');
    }
  };

  if (loading) return <div>Loading guards...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container glass-panel">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Security Personnel</h2>
          <p>Manage and view security guards assigned to gates.</p>
        </div>
        <button onClick={() => setIsCreatingGuard(true)} className="glass-button" style={{ background: '#3B82F6', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          Add Guard
        </button>
      </div>

      <div className="table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Guard Name</th>
              <th>Society</th>
              <th>Phone</th>
              <th>Gate No.</th>
              <th>Shift</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {guards.map(guard => (
              <tr key={guard._id}>
                <td>
                  <div className="user-info">
                    <span className="user-name">{guard.user?.name || 'Unknown'}</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: '500', color: '#64748b' }}>
                    {guard.societyId?.name || guard.societyName || 'N/A'}
                  </span>
                </td>
                <td>{guard.user?.phone}</td>
                <td><span className="badge warning">{guard.gateNumber}</span></td>
                <td>
                  <span className={`badge ${guard.shift === 'MORNING' ? 'info' : guard.shift === 'NIGHT' ? 'danger' : 'success'}`}>
                    {guard.shift}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      setEditGuard(guard);
                      setFormData({ shift: guard.shift, gateNumber: guard.gateNumber });
                    }} className="action-btn edit-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', marginRight: '10px' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(guard._id)} className="action-btn delete-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {guards.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No guards found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isCreatingGuard && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setIsCreatingGuard(false)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Add Security Guard</h3>
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Society</label>
                <select value={createData.societyId} onChange={e => setCreateData({...createData, societyId: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required>
                  {societies.map(soc => (
                    <option key={soc._id} value={soc._id}>{soc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Full Name</label>
                <input type="text" value={createData.name} onChange={e => setCreateData({...createData, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Phone (Login ID)</label>
                <input type="text" value={createData.phone} onChange={e => setCreateData({...createData, phone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Password</label>
                <input type="password" value={createData.password} onChange={e => setCreateData({...createData, password: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <small style={{ color: '#64748b' }}>Leave blank if user exists</small>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Gate Number</label>
                <input type="text" value={createData.gateNumber} onChange={e => setCreateData({...createData, gateNumber: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Shift</label>
                <select value={createData.shift} onChange={e => setCreateData({...createData, shift: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <option value="MORNING">Morning</option>
                  <option value="EVENING">Evening</option>
                  <option value="NIGHT">Night</option>
                </select>
              </div>
              <button type="submit" style={{ background: '#3B82F6', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                Add Guard
              </button>
            </form>
          </div>
        </div>
      )}

      {editGuard && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setEditGuard(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Edit Guard</h3>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Gate Number</label>
                <input 
                  type="text" 
                  value={formData.gateNumber} 
                  onChange={e => setFormData({...formData, gateNumber: e.target.value})} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Shift</label>
                <select 
                  value={formData.shift} 
                  onChange={e => setFormData({...formData, shift: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                >
                  <option value="MORNING">Morning</option>
                  <option value="EVENING">Evening</option>
                  <option value="NIGHT">Night</option>
                </select>
              </div>
              <button type="submit" style={{ background: '#3B82F6', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guards;
