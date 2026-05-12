import { useAuthStore } from '@/store/authStore';
import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/features/events/EventCard';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useEvents();

  const events = data?.events || [];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Bem-vindo de volta, {user?.name}!</p>
        </div>
        {user?.role === 'ORGANIZER' && (
          <Link to="/events/new" className="btn-primary">
            + Criar Novo Evento
          </Link>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Meus Eventos</h3>
          <p className="stat-value">{events.length}</p>
        </div>
        <div className="stat-card">
          <h3>Inscrições Pendentes</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Próximas Partidas</h3>
          <p className="stat-value">0</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-activity">
          <h2>Seus Eventos</h2>
          
          {isLoading ? (
            <div className="loading-state">Carregando eventos...</div>
          ) : events.length > 0 ? (
            <div className="events-grid">
              {events.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Você ainda não criou nenhum evento.</p>
              {user?.role === 'ORGANIZER' && (
                <Link to="/events/new" className="btn-link">Criar meu primeiro evento</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
