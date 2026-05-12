import { useParams, useNavigate } from 'react-router-dom';
import { usePublicEvent, useRegisterForEvent, useCancelRegistration } from '@/hooks/usePlayer';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente (Aguardando aprovação)',
  CONFIRMED: 'Confirmado ✅',
  REJECTED: 'Rejeitado ❌',
  CANCELLED: 'Cancelado',
};

export default function EventPublicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isLoading, error } = usePublicEvent(id!);
  const registerMutation = useRegisterForEvent();
  const cancelMutation = useCancelRegistration();

  if (isLoading) return <div className="loading-state">Carregando evento...</div>;
  if (error || !data?.event) return <div className="error-state">Evento não encontrado.</div>;

  const event = data.event;
  const myRegistration = data.myRegistration;
  const matches = event.matches || [];

  const handleRegister = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await registerMutation.mutateAsync(id!);
    } catch (err: any) {
      alert(err.message || 'Erro ao se inscrever.');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar sua inscrição?')) return;
    try {
      await cancelMutation.mutateAsync(id!);
    } catch (err: any) {
      alert(err.message || 'Erro ao cancelar inscrição.');
    }
  };

  const registrationCount = event._count?.registrations ?? 0;
  const spotsLeft = event.maxParticipants ? event.maxParticipants - registrationCount : null;

  return (
    <div className="event-public-page">
      <button className="btn btn-secondary btn-sm back-btn" onClick={() => navigate('/discover')}>
        ← Voltar
      </button>

      {/* Hero */}
      <div className="event-public-hero glass-panel">
        <div className="event-public-meta">
          <span className="sport-chip">{event.sportType}</span>
          <span className={`status-badge status-${event.status.toLowerCase()}`}>
            {event.status === 'ACTIVE' ? 'Inscrições Abertas' : 
             event.status === 'CLOSED' ? 'Inscrições Encerradas' : 
             event.status === 'FINISHED' ? 'Evento Finalizado' : event.status}
          </span>
        </div>
        <h1 className="event-public-title">{event.name}</h1>
        <p className="event-public-organizer">Organizado por <strong>{event.organizer.name}</strong></p>

        {/* Stats */}
        <div className="event-public-stats">
          {event.startDate && (
            <div className="pub-stat">
              <span className="pub-stat-label">Data</span>
              <span className="pub-stat-val">{new Date(event.startDate).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
          <div className="pub-stat">
            <span className="pub-stat-label">Inscritos</span>
            <span className="pub-stat-val">{registrationCount}</span>
          </div>
          {event.maxParticipants && (
            <div className="pub-stat">
              <span className="pub-stat-label">Vagas</span>
              <span className="pub-stat-val" style={{ color: spotsLeft === 0 ? 'var(--accent-danger)' : 'var(--accent-primary)' }}>
                {spotsLeft === 0 ? 'Esgotado' : `${spotsLeft} restante${spotsLeft !== 1 ? 's' : ''}`}
              </span>
            </div>
          )}
          <div className="pub-stat">
            <span className="pub-stat-label">Partidas</span>
            <span className="pub-stat-val">{matches.length}</span>
          </div>
        </div>

        {/* Registration CTA */}
        <div className="registration-cta">
          {!user && (
            <div className="cta-block">
              <p className="text-secondary">Faça login para se inscrever neste evento.</p>
              <Button onClick={() => navigate('/login')}>Entrar e se inscrever</Button>
            </div>
          )}
          {user && !myRegistration && (
            <div className="cta-block">
              {event.status !== 'ACTIVE' ? (
                <p className="text-secondary">As inscrições para este evento não estão disponíveis.</p>
              ) : spotsLeft === 0 ? (
                <p className="text-danger font-bold">Este evento está lotado.</p>
              ) : (
                <Button onClick={handleRegister} isLoading={registerMutation.isPending} size="large">
                  🎯 Quero Participar!
                </Button>
              )}
            </div>
          )}
          {user && myRegistration && (
            <div className="cta-block">
              <div className="my-registration-badge">
                <span>Minha Inscrição:</span>
                <span className={`status-badge status-${myRegistration.status.toLowerCase()}`}>
                  {STATUS_LABELS[myRegistration.status] || myRegistration.status}
                </span>
              </div>
              {(myRegistration.status === 'PENDING') && (
                <Button variant="danger" size="small" onClick={handleCancel} isLoading={cancelMutation.isPending}>
                  Cancelar Inscrição
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="event-public-body">
        {event.description && (
          <div className="pub-section glass-panel">
            <h3>Sobre o Evento</h3>
            <p className="info-text">{event.description}</p>
          </div>
        )}

        {event.rules && (
          <div className="pub-section glass-panel">
            <h3>Regras</h3>
            <p className="info-text">{event.rules}</p>
          </div>
        )}

        {matches.length > 0 && (
          <div className="pub-section glass-panel">
            <h3>Partidas Agendadas ({matches.length})</h3>
            <div className="matches-list">
              {matches.map((match: any) => (
                <div key={match.id} className="match-card">
                  <div className="match-datetime">
                    {match.dateTime ? new Date(match.dateTime).toLocaleString('pt-BR') : 'Data a definir'}
                  </div>
                  <div className="match-teams">
                    <span className="team-name-display">{match.homeTeam?.name || 'A definir'}</span>
                    <div className="score-block">
                      <span className="score">{match.homeScore ?? '—'}</span>
                      <span className="score-sep">:</span>
                      <span className="score">{match.awayScore ?? '—'}</span>
                    </div>
                    <span className="team-name-display">{match.awayTeam?.name || 'A definir'}</span>
                  </div>
                  {match.venue && (
                    <p className="match-notes">📍 {match.venue.name} — {match.venue.address}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
