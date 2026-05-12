import { Link } from 'react-router-dom';
import './EventCard.css';

interface EventCardProps {
  event: {
    id: string;
    name: string;
    status: string;
    startDate: string | null;
    sportType: string;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const statusLabels: Record<string, string> = {
    DRAFT: 'Rascunho',
    ACTIVE: 'Ativo',
    CLOSED: 'Inscrições Fechadas',
    FINISHED: 'Finalizado',
  };

  return (
    <div className={`event-card status-${event.status.toLowerCase()}`}>
      <div className="event-card-header">
        <span className="event-sport">{event.sportType}</span>
        <span className={`event-status status-${event.status.toLowerCase()}`}>
          {statusLabels[event.status] || event.status}
        </span>
      </div>
      <div className="event-card-body">
        <h3>{event.name}</h3>
        {event.startDate && (
          <p className="event-date">
            📅 {new Date(event.startDate).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="event-card-footer">
        <Link to={`/events/${event.id}`} className="btn-secondary">
          Gerenciar
        </Link>
      </div>
    </div>
  );
}
