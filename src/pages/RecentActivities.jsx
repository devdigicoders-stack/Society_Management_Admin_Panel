import { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import api from '../services/api';
import { Activity, UserPlus, LogIn, Clock } from 'lucide-react';
import './Dashboard.css';

const RecentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.get('/dashboard/activities');
        if (response.data.success) {
          setActivities(response.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) return <Loader text="Loading..." />;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div className="page-container glass-panel" style={{ maxWidth: '800px', margin: '0 auto', marginTop: '20px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={24} color="#3B82F6" />
          Recent Activities
        </h2>
        <p style={{ color: '#64748b' }}>A timeline of latest events happening across your societies.</p>
      </div>

      <div className="activities-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No recent activities found.</div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="activity-card" style={{ 
              display: 'flex', 
              gap: '16px', 
              padding: '16px', 
              background: '#f8fafc', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0',
              alignItems: 'flex-start'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '8px', 
                background: act.type === 'NEW_USER' ? '#e0e7ff' : '#dcfce7',
                color: act.type === 'NEW_USER' ? '#4f46e5' : '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {act.type === 'NEW_USER' ? <UserPlus size={20} /> : <LogIn size={20} />}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>{act.title}</h4>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {new Date(act.timestamp).toLocaleString()}
                  </span>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b' }}>{act.description}</p>
                <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px', padding: '4px 8px' }}>
                  Society: {act.society}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivities;


