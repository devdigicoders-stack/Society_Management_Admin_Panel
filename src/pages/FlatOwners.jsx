import { useState, useEffect } from 'react';
import api from '../services/api';
import './FlatOwners.css';

const FlatOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await api.get('/flat-owners/');
        if (response.data.success) {
          setOwners(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch flat owners');
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);

  if (loading) return <div>Loading flat owners...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="page-container glass-panel">
      <div className="page-header">
        <h2>Flat Owners Directory</h2>
        <p>View all registered flat owners in the society.</p>
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
            </tr>
          </thead>
          <tbody>
            {owners.map(owner => (
              <tr key={owner._id}>
                <td>
                  <div className="user-info">
                    <span className="user-name">{owner?.name || 'Unknown'}</span>
                    <span className="user-email">{owner?.phone}</span>
                  </div>
                </td>
                <td>{owner.societyName}</td>
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
              </tr>
            ))}
            {owners.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No flat owners found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlatOwners;
