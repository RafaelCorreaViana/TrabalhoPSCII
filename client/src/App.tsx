import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import EventsList from '@/pages/EventsList';
import EventCreate from '@/pages/EventCreate';
import EventDetail from '@/pages/EventDetail';
import EventEdit from '@/pages/EventEdit';
import EventsDiscover from '@/pages/EventsDiscover';
import EventPublicDetail from '@/pages/EventPublicDetail';
import Teams from '@/pages/Teams';
import Matches from '@/pages/Matches';
import Venues from '@/pages/Venues';
import VenueDetail from '@/pages/VenueDetail';
import Layout from '@/components/Layout';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <div className="loading-fullscreen">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />

            {/* Módulo do Organizador */}
            <Route path="/events" element={<EventsList />} />
            <Route path="/events/new" element={<EventCreate />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/:id/edit" element={<EventEdit />} />

            {/* Módulo do Jogador - Fase 4 */}
            <Route path="/discover" element={<EventsDiscover />} />
            <Route path="/discover/:id" element={<EventPublicDetail />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/matches" element={<Matches />} />

            {/* Módulo de Locais - Fase 5 */}
            <Route path="/venues" element={<Venues />} />
            <Route path="/venues/:id" element={<VenueDetail />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
