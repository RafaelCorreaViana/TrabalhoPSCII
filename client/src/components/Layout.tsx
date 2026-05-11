import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LogOut, Home, Calendar, Users, Trophy } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>SportHub</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className="nav-item"><Home size={20} /> Dashboard</Link>
          <Link to="/events" className="nav-item"><Calendar size={20} /> Eventos</Link>
          <Link to="/teams" className="nav-item"><Users size={20} /> Equipes</Link>
          <Link to="/matches" className="nav-item"><Trophy size={20} /> Partidas</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="topbar">
          <div className="user-info">
            <span>Olá, {user?.name}</span>
            <span className="badge">{user?.role}</span>
          </div>
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} /> Sair
          </button>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
