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
    <div className="animate-fade-in" style={{ paddingBottom: '20px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Minhas Partidas</h1>
        <p className="page-subtitle">Histórico e próximas partidas em todos os eventos.</p>
      </div>

      {isLoading ? (
        <div className="loading-state">Carregando partidas...</div>
      ) : matches.length === 0 ? (
        <div className="empty-state card">
          <div style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}><Trophy size={48} /></div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Nenhuma partida encontrada</h3>
          <p style={{ fontSize: '0.85rem' }}>Inscreva-se em eventos para participar de partidas emocionantes!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {matches.map((match) => (
            <div key={match.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ 
                background: 'var(--bg-tertiary)', 
                padding: '0.75rem 1rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {match.event.name}
                </span>
                <span className={`status-badge status-${match.status.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                  {STATUS_LABELS[match.status]}
                </span>
              </div>

              <div style={{ padding: '1.25rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>
                    {match.homeTeam?.name || 'A definir'}
                  </div>
                  
                  <div style={{ 
                    padding: '0.5rem 1rem', 
                    background: 'var(--bg-tertiary)', 
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    color: 'var(--accent-primary)'
                  }}>
                    {match.homeScore ?? '-'} : {match.awayScore ?? '-'}
                  </div>

                  <div style={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>
                    {match.awayTeam?.name || 'A definir'}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div>📅 {match.dateTime ? new Date(match.dateTime).toLocaleString('pt-BR') : 'Data a definir'}</div>
                  {match.venue && <div>📍 {match.venue.name}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
