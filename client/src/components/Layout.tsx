import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';
import NotificationCenter from '@/components/NotificationCenter';
import { LogOut, Home, Calendar, Users, Trophy, Compass } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuthStore();

  // Conectar Socket.IO quando o usuário estiver logado
  useSocket(user?.id);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `nav-item${isActive ? ' active' : ''}`;

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>⚽ SportHub</h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {user?.role === 'ORGANIZER' ? 'Painel do Organizador' :
             user?.role === 'PLAYER' ? 'Painel do Jogador' : 'Painel do Admin'}
          </p>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={navClass}>
            <Home size={18} /> Dashboard
          </NavLink>
          <NavLink to="/discover" className={navClass}>
            <Compass size={18} /> Descobrir Eventos
          </NavLink>
          {user?.role === 'ORGANIZER' && (
            <NavLink to="/events" className={navClass}>
              <Calendar size={18} /> Meus Eventos
            </NavLink>
          )}
          <NavLink to="/teams" className={navClass}>
            <Users size={18} /> Equipes
          </NavLink>
          <NavLink to="/matches" className={navClass}>
            <Trophy size={18} /> Partidas
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="topbar">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1 }}>{user?.name}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{user?.email}</p>
            </div>
            <span className="badge">{user?.role}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationCenter />
            <button onClick={logout} className="logout-btn">
              <LogOut size={16} /> Sair
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
