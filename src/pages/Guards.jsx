import { useState, useEffect } from 'react';
import api from '../services/api';

const Guards = () => {
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    fetchGuards();
  }, []);

  if (loading) return <div>Loading guards...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container glass-panel">
      <div className="page-header">
        <h2>Security Personnel</h2>
        <p>Manage and view security guards assigned to gates.</p>
      </div>

      <div className="table-container">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Guard Name</th>
              <th>Phone</th>
              <th>Society</th>
              <th>Gate No.</th>
              <th>Shift</th>
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
                <td>{guard.user?.phone}</td>
                <td>{guard.societyName}</td>
                <td><span className="badge warning">{guard.gateNumber}</span></td>
                <td>
                  <span className={`badge ${guard.shift === 'MORNING' ? 'info' : guard.shift === 'NIGHT' ? 'danger' : 'success'}`}>
                    {guard.shift}
                  </span>
                </td>
              </tr>
            ))}
            {guards.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No guards found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Guards;
