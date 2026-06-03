import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import api from '../services/api';
import { Edit2, Trash2, X } from 'lucide-react';

const GuestHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editGuest, setEditGuest] = useState(null);
  const [formData, setFormData] = useState({ guestName: '', guestPhone: '', purpose: '', vehicleNumber: '' });

  const fetchHistory = async () => {
    try {
      const response = await api.get('/guests/history');
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch guest history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this guest record?")) return;
    try {
      const res = await api.delete(`/guests/${id}`);
      if (res.data.success) {
        setHistory(history.filter(g => g._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete guest');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/guests/${editGuest._id}`, formData);
      if (res.data.success) {
        setHistory(history.map(g => g._id === editGuest._id ? res.data.data : g));
        setEditGuest(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update guest');
    }
  };

  if (loading) return <Loader text="Loading..." />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container glass-panel">
      <div className="page-header">
        <h2>Guest History</h2>
        <p>View all visitor logs across the society.</p>
      </div>

      <div className="table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Phone</th>
              <th>Purpose</th>
              <th>Vehicle</th>
              <th>Society</th>
              <th>Status</th>
              <th>Host (Flat Owner)</th>
              <th>Entry Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map(guest => (
              <tr key={guest._id}>
                <td>
                  <div className="user-info">
                    <span className="user-name">{guest.guestName}</span>
                  </div>
                </td>
                <td>{guest.guestPhone}</td>
                <td>{guest.purpose}</td>
                <td>{guest.vehicleNumber || 'N/A'}</td>
                <td>
                  <span className="badge info">
                    {guest.societyId?.name || 'N/A'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${
                    guest.status === 'APPROVED' ? 'success' : 
                    guest.status === 'PENDING' ? 'warning' : 
                    guest.status === 'REJECTED' ? 'danger' : 'info'
                  }`}>
                    {guest.status}
                  </span>
                </td>
                <td>{guest.flatOwner?.name || 'N/A'}</td>
                <td>{guest.entryTime ? new Date(guest.entryTime).toLocaleString() : 'N/A'}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      setEditGuest(guest);
                      setFormData({ 
                        guestName: guest.guestName || '', 
                        guestPhone: guest.guestPhone || '', 
                        purpose: guest.purpose || '', 
                        vehicleNumber: guest.vehicleNumber || '' 
                      });
                    }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', marginRight: '10px' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(guest._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No guest history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editGuest && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setEditGuest(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Edit Guest</h3>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Guest Name</label>
                <input type="text" value={formData.guestName} onChange={e => setFormData({...formData, guestName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Phone</label>
                <input type="text" value={formData.guestPhone} onChange={e => setFormData({...formData, guestPhone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Purpose</label>
                <input type="text" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Vehicle Number</label>
                <input type="text" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
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

export default GuestHistory;


