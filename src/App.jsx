import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import LiveNeedsMap from './pages/LiveNeedsMap';
import AddCommunityNeed from './pages/AddCommunityNeed';
import VolunteerRegistration from './pages/VolunteerRegistration';
import VolunteerMatching from './pages/VolunteerMatching';
import VolunteerApp from './pages/VolunteerMobileApp';
import ImpactDashboard from './pages/ImpactDashboard';
import PublicImpactMap from './pages/PublicImpactMap';
import CaseStudyDetail from './pages/CaseStudyDetail';
import ImpactReports from './pages/ImpactReports';
import AIChatbot from './components/AIChatbot';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!currentUser) return <Navigate to="/" />;
  if (allowedRole && userRole !== allowedRole) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register-volunteer" element={<VolunteerRegistration />} />
          <Route path="/map" element={<PublicImpactMap />} />
          <Route path="/case-study/:id" element={<CaseStudyDetail />} />
          <Route path="/reports" element={<ImpactReports />} />
          
          {/* NGO Coordinator Routes */}
          <Route path="/coordinator" element={
            <ProtectedRoute allowedRole="coordinator">
              <CoordinatorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/coordinator/add-need" element={
            <ProtectedRoute allowedRole="coordinator">
              <AddCommunityNeed />
            </ProtectedRoute>
          } />
          <Route path="/coordinator/map" element={
            <ProtectedRoute allowedRole="coordinator">
              <LiveNeedsMap />
            </ProtectedRoute>
          } />
          <Route path="/coordinator/matching/:needId" element={
            <ProtectedRoute allowedRole="coordinator">
              <VolunteerMatching />
            </ProtectedRoute>
          } />
          <Route path="/coordinator/impact" element={
            <ProtectedRoute allowedRole="coordinator">
              <ImpactDashboard />
            </ProtectedRoute>
          } />

          {/* Volunteer Routes */}
          <Route path="/volunteer" element={
            <ProtectedRoute allowedRole="volunteer">
              <VolunteerApp />
            </ProtectedRoute>
          } />
        </Routes>
        <AIChatbot />
      </Router>
    </AuthProvider>
  );
}

export default App;
