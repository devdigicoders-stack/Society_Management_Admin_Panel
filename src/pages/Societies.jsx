import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import api from '../services/api';
import { Edit2, Trash2, X } from 'lucide-react';

const Societies = () => {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create State
  const [isCreatingSociety, setIsCreatingSociety] = useState(false);
  const [createData, setCreateData] = useState({ name: '', address: '', registrationNumber: '', contactEmail: '', contactPhone: '' });
  
  // Edit State
  const [editSociety, setEditSociety] = useState(null);
  const [formData, setFormData] = useState({ name: '', address: '', registrationNumber: '', contactEmail: '', contactPhone: '' });

  const fetchSocieties = async () => {
    try {
      const response = await api.get('/societies');
      if (response.data.success) {
        setSocieties(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch societies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocieties();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/societies', createData);
      if (res.data.success) {
        setSocieties([...societies, res.data.data]);
        setIsCreatingSociety(false);
        setCreateData({ name: '', address: '', registrationNumber: '', contactEmail: '', contactPhone: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create society');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/societies/${editSociety._id}`, formData);
      if (res.data.success) {
        setSocieties(societies.map(s => s._id === editSociety._id ? res.data.data : s));
        setEditSociety(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update society');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this society? This may affect linked flat owners and guards.")) return;
    try {
      const res = await api.delete(`/societies/${id}`);
      if (res.data.success) {
        setSocieties(societies.filter(s => s._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete society');
    }
  };

  if (loading) return <Loader text="Loading..." />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container glass-panel">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Societies Directory</h2>
          <p>Manage all registered societies on the platform.</p>
        </div>
        <button onClick={() => setIsCreatingSociety(true)} className="glass-button" style={{ background: '#3B82F6', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          Register Society
        </button>
      </div>

      <div className="table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Society Name</th>
              <th>Address</th>
              <th>Registration No.</th>
              <th>Contact Info</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {societies.map(society => (
              <tr key={society._id}>
                <td>
                  <div className="user-info">
                    <span className="user-name">{society.name}</span>
                  </div>
                </td>
                <td>{society.address}</td>
                <td><span className="badge info">{society.registrationNumber}</span></td>
                <td>
                  <div>{society.contactPhone}</div>
                  <div style={{ fontSize: '0.85em', color: '#64748b' }}>{society.contactEmail}</div>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      setEditSociety(society);
                      setFormData({ 
                        name: society.name || '', 
                        address: society.address || '', 
                        registrationNumber: society.registrationNumber || '', 
                        contactEmail: society.contactEmail || '',
                        contactPhone: society.contactPhone || '' 
                      });
                    }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', marginRight: '10px' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(society._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {societies.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No societies found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isCreatingSociety && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setIsCreatingSociety(false)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Register New Society</h3>
            <form onSubmit={handleCreateSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Society Name</label>
                <input type="text" value={createData.name} onChange={e => setCreateData({...createData, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Address</label>
                <textarea value={createData.address} onChange={e => setCreateData({...createData, address: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required rows="2" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Registration Number</label>
                <input type="text" value={createData.registrationNumber} onChange={e => setCreateData({...createData, registrationNumber: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Contact Email</label>
                <input type="email" value={createData.contactEmail} onChange={e => setCreateData({...createData, contactEmail: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Contact Phone</label>
                <input type="text" value={createData.contactPhone} onChange={e => setCreateData({...createData, contactPhone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <button type="submit" style={{ background: '#3B82F6', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                Register Society
              </button>
            </form>
          </div>
        </div>
      )}

      {editSociety && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setEditSociety(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Edit Society</h3>
            <form onSubmit={handleEditSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Society Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Address</label>
                <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required rows="2" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Registration Number</label>
                <input type="text" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Contact Email</label>
                <input type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Contact Phone</label>
                <input type="text" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
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

export default Societies;


