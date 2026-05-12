import { usePlayerMatches } from '@/hooks/usePlayer';
import { Trophy } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendada',
  IN_PROGRESS: 'Em Andamento',
  FINISHED: 'Finalizada',
  CANCELLED: 'Cancelada',
};

export default function Matches() {
  const { data, isLoading } = usePlayerMatches();
  const matches: any[] = data?.matches || [];

  return (
    <div className="matches-page">
      <div className="page-header">
        <h1>Minhas Partidas</h1>
        <p className="text-secondary">Histórico e próximas partidas em todos os eventos.</p>
      </div>

      {isLoading ? (
        <div className="loading-state">Carregando partidas...</div>
      ) : matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Trophy size={48} /></div>
          <h3>Nenhuma partida encontrada</h3>
          <p className="text-secondary">Inscreva-se em eventos para participar de partidas emocionantes!</p>
        </div>
      ) : (
        <div className="matches-list-container">
          <div className="matches-timeline">
            {matches.map((match) => (
              <div key={match.id} className="match-timeline-item glass-panel">
                <div className="match-timeline-header">
                  <span className="match-event-name">{match.event.name}</span>
                  <span className={`status-badge status-${match.status.toLowerCase()}`}>
                    {STATUS_LABELS[match.status]}
                  </span>
                </div>

                <div className="match-main-content">
                  <div className="team-display home">
                    <span className="team-name">{match.homeTeam?.name || 'A definir'}</span>
                  </div>
                  
                  <div className="match-score-display">
                    <span className="score">{match.homeScore ?? '—'}</span>
                    <span className="score-divider">:</span>
                    <span className="score">{match.awayScore ?? '—'}</span>
                  </div>

                  <div className="team-display away">
                    <span className="team-name">{match.awayTeam?.name || 'A definir'}</span>
                  </div>
                </div>

                <div className="match-timeline-footer">
                  <div className="match-info-item">
                    📅 {match.dateTime ? new Date(match.dateTime).toLocaleString('pt-BR') : 'Data a definir'}
                  </div>
                  {match.venue && (
                    <div className="match-info-item">
                      📍 {match.venue.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
