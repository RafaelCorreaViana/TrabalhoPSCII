import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useSocket } from '@/hooks/useSocket';
import NotificationCenter from '@/components/NotificationCenter';
import { LogOut, Home, Calendar, Users, Trophy, Compass, MapPin, Sun, Moon } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/':         'Início',
  '/discover': 'Descobrir',
  '/events':   'Meus Eventos',
  '/teams':    'Equipes',
  '/matches':  'Partidas',
  '/venues':   'Locais',
};

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();

  useSocket(user?.id);

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'SportHub';

  const navClass = (path: string) =>
    `bottom-nav-item${location.pathname === path || (path !== '/' && location.pathname.startsWith(path)) ? ' active' : ''}`;

  return (
    <div className="app-shell">
      {/* ── TOP BAR ─────────────────────────────── */}
      <header className="topbar">
        <span className="topbar-brand">⚽ SportHub</span>

        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', flex: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {pageTitle}
        </span>

        <div className="topbar-actions">
          <button
            className="topbar-icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            id="theme-toggle-btn"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div style={{ position: 'relative' }}>
            <NotificationCenter />
          </div>

          <button onClick={logout} className="topbar-icon-btn" title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ── PAGE CONTENT ────────────────────────── */}
      <main className="page-content">
        <Outlet />
      </main>

      {/* ── BOTTOM NAVIGATION ───────────────────── */}
      <nav className="bottom-nav">
        <NavLink to="/" end className={() => navClass('/')}>
          <div className="nav-icon"><Home size={20} /></div>
          <span>Início</span>
        </NavLink>

        <NavLink to="/discover" className={() => navClass('/discover')}>
          <div className="nav-icon"><Compass size={20} /></div>
          <span>Descobrir</span>
        </NavLink>

        {user?.role === 'ORGANIZER' && (
          <NavLink to="/events" className={() => navClass('/events')}>
            <div className="nav-icon"><Calendar size={20} /></div>
            <span>Eventos</span>
          </NavLink>
        )}

        <NavLink to="/teams" className={() => navClass('/teams')}>
          <div className="nav-icon"><Users size={20} /></div>
          <span>Equipes</span>
        </NavLink>

        <NavLink to="/matches" className={() => navClass('/matches')}>
          <div className="nav-icon"><Trophy size={20} /></div>
          <span>Partidas</span>
        </NavLink>

        <NavLink to="/venues" className={() => navClass('/venues')}>
          <div className="nav-icon"><MapPin size={20} /></div>
          <span>Locais</span>
        </NavLink>
      </nav>
    </div>
  );
}
