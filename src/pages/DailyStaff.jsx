import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Edit2, Trash2, X } from 'lucide-react';

const DailyStaff = () => {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit State
  const [editingStaff, setEditingStaff] = useState(null);
  const [editForm, setEditForm] = useState({ 
    staffName: '', staffPhone: '', staffType: '', 
    allowedDays: [], entryTime: '', exitTime: '' 
  });

  const fetchStaff = async () => {
    try {
      const response = await api.get('/daily-staff/');
      if (response.data.success) {
        setStaffList(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch daily staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleDelete = async (staffId) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await api.delete(`/daily-staff/${staffId}`);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete staff');
    }
  };

  const startEdit = (staff) => {
    setEditingStaff(staff._id);
    setEditForm({
      staffName: staff.staffName,
      staffPhone: staff.staffPhone,
      staffType: staff.staffType,
      allowedDays: staff.allowedDays || [],
      entryTime: staff.entryTime || '',
      exitTime: staff.exitTime || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/daily-staff/${editingStaff}`, editForm);
      setEditingStaff(null);
      fetchStaff();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update staff');
    }
  };

  const handleDayToggle = (day) => {
    if (editForm.allowedDays.includes(day)) {
      setEditForm({ ...editForm, allowedDays: editForm.allowedDays.filter(d => d !== day) });
    } else {
      setEditForm({ ...editForm, allowedDays: [...editForm.allowedDays, day] });
    }
  };

  if (loading) return <Loader text="Loading..." />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container glass-panel">
      <div className="page-header">
        <h2>Daily Staff Directory</h2>
        <p>View, edit, and delete registered service providers.</p>
      </div>

      <div className="table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Phone</th>
              <th>Type</th>
              <th>Status</th>
              <th>Flat Owner</th>
              <th>Allowed Days</th>
              <th>Timing</th>
              {user?.role === 'SUPER_ADMIN' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {staffList.map(staff => (
              <tr key={staff._id}>
                <td>
                  <div className="user-info">
                    <span className="user-name">{staff.staffName}</span>
                  </div>
                </td>
                <td>{staff.staffPhone}</td>
                <td><span className="badge info">{staff.staffType}</span></td>
                <td>
                  {staff.isBlocked ? (
                    <span className="badge danger">Blocked</span>
                  ) : (
                    <span className="badge success">Active</span>
                  )}
                </td>
                <td>{staff.flatOwner?.name || 'N/A'}</td>
                <td>
                  <div className="vehicles-list">
                    {staff.allowedDays?.map((day, i) => (
                      <span key={i} className="badge" style={{ background: '#f4f6f8', border: '1px solid var(--panel-border)', color: 'var(--text-main)' }}>{day}</span>
                    ))}
                  </div>
                </td>
                <td style={{ fontSize: '0.85rem' }}>
                  {staff.entryTime} - {staff.exitTime}
                </td>
                {user?.role === 'SUPER_ADMIN' && (
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => startEdit(staff)} className="icon-btn info" style={{ background: '#fff', border: '1px solid #dfe3e8', padding: '8px', borderRadius: '6px', cursor: 'pointer' }} title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(staff._id)} className="icon-btn danger" style={{ background: '#fff', border: '1px solid #dfe3e8', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: '#ff4842' }} title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {staffList.length === 0 && (
              <tr>
                <td colSpan={user?.role === 'SUPER_ADMIN' ? "8" : "7"} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No daily staff found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingStaff && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-panel" style={{ background: '#fff', padding: '24px', width: '100%', maxWidth: '400px', borderRadius: '8px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3>Edit Daily Staff</h3>
              <button onClick={() => setEditingStaff(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Staff Name</label>
                <input className="glass-input" value={editForm.staffName} onChange={e => setEditForm({...editForm, staffName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="glass-input" value={editForm.staffPhone} onChange={e => setEditForm({...editForm, staffPhone: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select className="glass-input" value={editForm.staffType} onChange={e => setEditForm({...editForm, staffType: e.target.value})}>
                  <option value="MAID">MAID</option>
                  <option value="DRIVER">DRIVER</option>
                  <option value="COOK">COOK</option>
                  <option value="CLEANER">CLEANER</option>
                  <option value="MILKMAN">MILKMAN</option>
                  <option value="NEWSPAPER">NEWSPAPER</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <div className="form-group">
                <label>Allowed Days</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                    <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={editForm.allowedDays.includes(day)}
                        onChange={() => handleDayToggle(day)}
                      /> {day}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Entry Time</label>
                  <input className="glass-input" type="time" value={editForm.entryTime} onChange={e => setEditForm({...editForm, entryTime: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Exit Time</label>
                  <input className="glass-input" type="time" value={editForm.exitTime} onChange={e => setEditForm({...editForm, exitTime: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="glass-button full-width">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyStaff;


