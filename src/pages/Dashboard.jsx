import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Users, Home, ShieldCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import './Dashboard.css';

const COLORS = ['#00a76f', '#007867', '#8e33ff', '#ffab00'];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFlatOwners: 0,
    totalGuards: 0,
    totalStaff: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = [
    { name: 'Users', count: stats.totalUsers },
    { name: 'Owners', count: stats.totalFlatOwners },
    { name: 'Guards', count: stats.totalGuards },
    { name: 'Staff', count: stats.totalStaff },
  ];

  const pieData = [
    { name: 'Flat Owners', value: stats.totalFlatOwners },
    { name: 'Guards', value: stats.totalGuards },
    { name: 'Daily Staff', value: stats.totalStaff },
  ];

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard Overview</h1>
      <p className="page-subtitle">Welcome to the Society Management Admin Portal.</p>
      
      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon users">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Registered Users</h3>
            <p className="stat-value">{loading ? '...' : stats.totalUsers}</p>
          </div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-icon homes">
            <Home size={24} />
          </div>
          <div className="stat-info">
            <h3>Flat Owners</h3>
            <p className="stat-value">{loading ? '...' : stats.totalFlatOwners}</p>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon guards">
            <ShieldCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>Active Guards</h3>
            <p className="stat-value">{loading ? '...' : stats.totalGuards}</p>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon activity">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3>Daily Staff</h3>
            <p className="stat-value text-success">{loading ? '...' : stats.totalStaff}</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card glass-panel">
          <h3 className="chart-title">System Overview</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#919eab" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#919eab" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{stroke: '#f4f6f8', strokeWidth: 2}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="#00a76f" strokeWidth={3} dot={{ r: 5, fill: '#00a76f' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-panel">
          <h3 className="chart-title">Role Distribution</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {pieData.map((entry, index) => (
                <div key={index} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="legend-label">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
