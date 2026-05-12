import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useEvents } from '@/hooks/useEvents';
import { usePlayerDashboard } from '@/hooks/usePlayer';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  ACTIVE: 'Ativo',
  CLOSED: 'Fechado',
  FINISHED: 'Finalizado',
};

const REG_LABELS: Record<string, string> = {
  PENDING: 'Aguardando',
  CONFIRMED: 'Confirmado',
  REJECTED: 'Rejeitado',
  CANCELLED: 'Cancelado',
};

function OrganizerDashboard() {
  const { data, isLoading } = useEvents();
  const events: any[] = data?.events || [];
  const active = events.filter((e) => e.status === 'ACTIVE').length;
  const draft = events.filter((e) => e.status === 'DRAFT').length;
  const totalRegistrations = events.reduce((sum: number, e: any) => sum + (e.registrations?.length || 0), 0);

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>Dashboard do Organizador</h1>
        <Link to="/events/new" className="btn btn-primary btn-md">+ Criar Evento</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total de Eventos</h3>
          <p className="stat-value">{isLoading ? '…' : events.length}</p>
        </div>
        <div className="stat-card">
          <h3>Eventos Ativos</h3>
          <p className="stat-value" style={{ color: 'var(--accent-primary)' }}>{isLoading ? '…' : active}</p>
        </div>
        <div className="stat-card">
          <h3>Rascunhos</h3>
          <p className="stat-value">{isLoading ? '…' : draft}</p>
        </div>
        <div className="stat-card">
          <h3>Total de Inscrições</h3>
          <p className="stat-value">{isLoading ? '…' : totalRegistrations}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header-row">
          <h2>Seus Eventos Recentes</h2>
          <Link to="/events" className="btn-link">Ver todos →</Link>
        </div>

        {isLoading ? (
          <div className="loading-state">Carregando...</div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '2.5rem' }}>🏆</p>
            <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>Nenhum evento criado ainda.</p>
            <Link to="/events/new" className="btn btn-primary btn-md" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              Criar meu primeiro evento
            </Link>
          </div>
        ) : (
          <div className="events-grid">
            {events.slice(0, 6).map((ev: any) => (
              <Link to={`/events/${ev.id}`} key={ev.id} className="event-dash-card">
                <div className="event-dash-card-top">
                  <span className="sport-chip">{ev.sportType}</span>
                  <span className={`status-badge status-${ev.status.toLowerCase()}`}>{STATUS_LABELS[ev.status]}</span>
                </div>
                <h3>{ev.name}</h3>
                <p className="text-secondary text-sm">
                  {ev.startDate ? new Date(ev.startDate).toLocaleDateString('pt-BR') : 'Sem data'}
                </p>
                <p className="event-dash-registrations">
                  👥 {ev.registrations?.length || 0} inscrito{ev.registrations?.length !== 1 ? 's' : ''}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerDashboard() {
  const { data, isLoading } = usePlayerDashboard();
  const registrations: any[] = data?.registrations || [];
  const upcomingMatches: any[] = data?.upcomingMatches || [];

  const confirmed = registrations.filter((r) => r.status === 'CONFIRMED').length;
  const pending = registrations.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>Minha Área</h1>
        <Link to="/discover" className="btn btn-primary btn-md">🔍 Descobrir Eventos</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Eventos Inscritos</h3>
          <p className="stat-value">{isLoading ? '…' : registrations.length}</p>
        </div>
        <div className="stat-card">
          <h3>Confirmados</h3>
          <p className="stat-value" style={{ color: 'var(--accent-primary)' }}>{isLoading ? '…' : confirmed}</p>
        </div>
        <div className="stat-card">
          <h3>Aguardando</h3>
          <p className="stat-value" style={{ color: 'var(--accent-warning)' }}>{isLoading ? '…' : pending}</p>
        </div>
        <div className="stat-card">
          <h3>Próximas Partidas</h3>
          <p className="stat-value">{isLoading ? '…' : upcomingMatches.length}</p>
        </div>
      </div>

      <div className="dashboard-body-grid">
        {/* Próximas Partidas */}
        <div className="dashboard-section">
          <h2>Próximas Partidas</h2>
          {isLoading ? (
            <div className="loading-state">Carregando...</div>
          ) : upcomingMatches.length === 0 ? (
            <div className="empty-state-small">Nenhuma partida próxima.</div>
          ) : (
            <div className="upcoming-matches">
              {upcomingMatches.map((match: any) => (
                <div key={match.id} className="upcoming-match-card">
                  <span className="match-event-label">{match.event.name}</span>
                  <div className="match-teams">
                    <span className="team-name-display">{match.homeTeam?.name || '—'}</span>
                    <div className="score-block">
                      <span className="score">—</span>
                      <span className="score-sep">:</span>
                      <span className="score">—</span>
                    </div>
                    <span className="team-name-display">{match.awayTeam?.name || '—'}</span>
                  </div>
                  <p className="match-datetime">
                    {match.dateTime ? new Date(match.dateTime).toLocaleString('pt-BR') : '—'}
                  </p>
                  {match.venue && <p className="match-notes">📍 {match.venue.name}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Minhas Inscrições */}
        <div className="dashboard-section">
          <div className="section-header-row">
            <h2>Minhas Inscrições</h2>
            <Link to="/discover" className="btn-link">Buscar mais →</Link>
          </div>
          {isLoading ? (
            <div className="loading-state">Carregando...</div>
          ) : registrations.length === 0 ? (
            <div className="empty-state-small">
              Você ainda não se inscreveu em nenhum evento.
            </div>
          ) : (
            <div className="my-registrations-list">
              {registrations.map((reg: any) => (
                <Link to={`/discover/${reg.event.id}`} key={reg.id} className="my-reg-card">
                  <div className="my-reg-info">
                    <h4>{reg.event.name}</h4>
                    <p className="text-secondary text-sm">
                      {reg.event.startDate ? new Date(reg.event.startDate).toLocaleDateString('pt-BR') : 'Sem data'}
                      {' · '}{reg.event.organizer.name}
                    </p>
                  </div>
                  <span className={`status-badge status-${reg.status.toLowerCase()}`}>
                    {REG_LABELS[reg.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();

  if (user?.role === 'ORGANIZER') return <OrganizerDashboard />;
  return <PlayerDashboard />;
}
