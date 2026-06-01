import { useState, useEffect } from 'react';
import api from '../services/api';

const GuestHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    fetchHistory();
  }, []);

  if (loading) return <div>Loading guest history...</div>;
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
              <th>Status</th>
              <th>Guard</th>
              <th>Host (Flat Owner)</th>
              <th>Entry Time</th>
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
                <td>
                  <span className={`badge ${
                    guest.status === 'APPROVED' ? 'success' : 
                    guest.status === 'PENDING' ? 'warning' : 
                    guest.status === 'REJECTED' ? 'danger' : 'info'
                  }`}>
                    {guest.status}
                  </span>
                </td>
                <td>{guest.guard?.name || 'N/A'}</td>
                <td>{guest.flatOwner?.name || 'N/A'}</td>
                <td>{guest.entryTime ? new Date(guest.entryTime).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No guest history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuestHistory;
