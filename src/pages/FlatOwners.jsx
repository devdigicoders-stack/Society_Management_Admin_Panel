import { useState, useEffect } from 'react';
import api from '../services/api';
import './FlatOwners.css';
import { Edit2, Trash2, X } from 'lucide-react';

const FlatOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOwner, setEditOwner] = useState(null);
  const [isCreatingOwner, setIsCreatingOwner] = useState(false);
  const [societies, setSocieties] = useState([]);
  const [formData, setFormData] = useState({ tower: '', floor: '', flatNumber: '', familyMembers: '', vehicleNumbers: '' });
  const [createData, setCreateData] = useState({ name: '', phone: '', password: '', tower: '', floor: '', flatNumber: '', familyMembers: '', vehicleNumbers: '', societyId: '' });

  const fetchOwners = async () => {
    try {
      const response = await api.get('/flat-owners');
      if (response.data.success) {
        setOwners(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch flat owners');
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
    fetchOwners();
    fetchSocieties();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this flat owner? Their user account will also be deleted.")) return;
    try {
      const res = await api.delete(`/flat-owners/${id}`);
      if (res.data.success) {
        setOwners(owners.filter(o => o._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete flat owner');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const vehicleNumbersArray = typeof formData.vehicleNumbers === 'string' 
        ? formData.vehicleNumbers.split(',').map(v => v.trim()).filter(v => v) 
        : formData.vehicleNumbers;
      
      const payload = { ...formData, vehicleNumbers: vehicleNumbersArray };
      const res = await api.put(`/flat-owners/${editOwner._id}`, payload);
      
      if (res.data.success) {
        setOwners(owners.map(o => o._id === editOwner._id ? res.data.data : o));
        setEditOwner(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update flat owner');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const vehicleNumbersArray = typeof createData.vehicleNumbers === 'string' 
        ? createData.vehicleNumbers.split(',').map(v => v.trim()).filter(v => v) 
        : createData.vehicleNumbers;
      
      const payload = { ...createData, vehicleNumbers: vehicleNumbersArray };
      const res = await api.post(`/flat-owners/admin`, payload);
      
      if (res.data.success) {
        setOwners([res.data.data, ...owners]);
        setIsCreatingOwner(false);
        setCreateData({ name: '', phone: '', password: '', tower: '', floor: '', flatNumber: '', familyMembers: '', vehicleNumbers: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create flat owner');
    }
  };

  if (loading) return <div>Loading flat owners...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container glass-panel">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Flat Owners Directory</h2>
          <p>View all registered flat owners in the society.</p>
        </div>
        <button onClick={() => setIsCreatingOwner(true)} className="glass-button" style={{ background: '#3B82F6', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          Create Flat Owner
        </button>
      </div>

      <div className="table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Owner Name</th>
              <th>Society</th>
              <th>Tower / Block</th>
              <th>Flat No.</th>
              <th>Vehicles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {owners.map(owner => (
              <tr key={owner._id}>
                <td>
                  <div className="user-info">
                    <span className="user-name">{owner.user?.name || 'Unknown'}</span>
                    <span className="user-email">{owner.user?.phone}</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: '500', color: '#64748b' }}>
                    {owner.societyId?.name || 'N/A'}
                  </span>
                </td>
                <td>{owner.tower} (Floor: {owner.floor})</td>
                <td><span className="badge info">{owner.flatNumber}</span></td>
                <td>
                  <div className="vehicles-list">
                    {owner.vehicleNumbers?.length > 0 ? (
                      owner.vehicleNumbers.map((v, i) => <span key={i} className="badge">{v}</span>)
                    ) : (
                      <span className="text-muted">None</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      setEditOwner(owner);
                      setFormData({ 
                        tower: owner.tower, 
                        floor: owner.floor, 
                        flatNumber: owner.flatNumber, 
                        familyMembers: owner.familyMembers || 0,
                        vehicleNumbers: owner.vehicleNumbers ? owner.vehicleNumbers.join(', ') : '' 
                      });
                    }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', marginRight: '10px' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(owner._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {owners.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No flat owners found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isCreatingOwner && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '500px', position: 'relative' }}>
            <button onClick={() => setIsCreatingOwner(false)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Register New Flat Owner</h3>
            <form onSubmit={handleCreateSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Society</label>
                <select value={createData.societyId} onChange={e => setCreateData({...createData, societyId: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required>
                  {societies.map(soc => (
                    <option key={soc._id} value={soc._id}>{soc.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tower / Block</label>
                <input type="text" value={createData.tower} onChange={e => setCreateData({...createData, tower: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Floor</label>
                <input type="text" value={createData.floor} onChange={e => setCreateData({...createData, floor: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Flat Number</label>
                <input type="text" value={createData.flatNumber} onChange={e => setCreateData({...createData, flatNumber: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Family Members</label>
                <input type="number" value={createData.familyMembers} onChange={e => setCreateData({...createData, familyMembers: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Vehicles (comma separated)</label>
                <input type="text" value={createData.vehicleNumbers} onChange={e => setCreateData({...createData, vehicleNumbers: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <button type="submit" style={{ gridColumn: '1 / -1', background: '#3B82F6', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                Create Flat Owner
              </button>
            </form>
          </div>
        </div>
      )}

      {editOwner && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setEditOwner(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Edit Flat Owner</h3>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tower / Block</label>
                <input type="text" value={formData.tower} onChange={e => setFormData({...formData, tower: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Floor</label>
                <input type="text" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Flat Number</label>
                <input type="text" value={formData.flatNumber} onChange={e => setFormData({...formData, flatNumber: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} required />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Family Members</label>
                <input type="number" value={formData.familyMembers} onChange={e => setFormData({...formData, familyMembers: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Vehicles (comma separated)</label>
                <input type="text" value={formData.vehicleNumbers} onChange={e => setFormData({...formData, vehicleNumbers: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
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

export default FlatOwners;
