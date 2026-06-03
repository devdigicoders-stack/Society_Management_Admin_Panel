import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import FlatOwners from './pages/FlatOwners';
import Guards from './pages/Guards';
import GuestHistory from './pages/GuestHistory';
import DailyStaff from './pages/DailyStaff';
import Societies from './pages/Societies';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'MANAGER']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            
            {/* Super Admin Only Route */}
            <Route path="users" element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            
            <Route path="societies" element={<Societies />} />
            <Route path="flat-owners" element={<FlatOwners />} />
            <Route path="guards" element={<Guards />} />
            <Route path="guest-history" element={<GuestHistory />} />
            <Route path="daily-staff" element={<DailyStaff />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
