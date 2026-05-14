import { useParams, useNavigate } from 'react-router-dom';
import { usePublicEvent, useRegisterForEvent, useCancelRegistration } from '@/hooks/usePlayer';
import { useAuthStore } from '@/store/authStore';
import { MapPin, Calendar as CalendarIcon, Clock, ArrowLeft, Navigation } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  REJECTED: 'Rejeitado',
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
  if (error || !data?.event) return <div className="empty-state">Evento não encontrado.</div>;

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
  const max = event.maxParticipants || '∞';

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
      <button className="btn-icon" onClick={() => navigate('/discover')} style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={20} />
      </button>

      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{event.name}</h1>
        <p className="page-subtitle" style={{ textTransform: 'capitalize' }}>
          {event.sportType} • Organizado por {event.organizer.name}
        </p>
      </div>

      {myRegistration && (
        <div style={{
          background: myRegistration.status === 'CONFIRMED' ? 'var(--accent-success)20' : 'var(--accent-warning)20',
          color: myRegistration.status === 'CONFIRMED' ? 'var(--accent-success)' : 'var(--accent-warning)',
          padding: '1rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          marginBottom: '1.5rem',
          border: `1px solid ${myRegistration.status === 'CONFIRMED' ? 'rgba(22,163,74,0.3)' : 'rgba(217,119,6,0.3)'}`
        }}>
          {myRegistration.status === 'CONFIRMED' ? '✅ Inscrição confirmada' : '⏳ Inscrição pendente (Aguardando aprovação)'}
        </div>
      )}

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
        {event.startDate && (
          <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '10px', borderRadius: '10px' }}>
              <CalendarIcon size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Data de Início</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                {new Date(event.startDate).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        )}
        
        <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--accent-primary)', padding: '10px', borderRadius: '10px' }}>
            <MapPin size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Inscrições</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
              {registrationCount} / {max} inscritos
            </div>
          </div>
        </div>
      </div>

      {event.description && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>Sobre o Evento</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{event.description}</p>
        </div>
      )}

      {matches.length > 0 && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} /> Partidas ({matches.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {matches.map((match: any) => (
              <div key={match.id} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {match.dateTime ? new Date(match.dateTime).toLocaleString('pt-BR') : 'Data a definir'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{match.homeTeam?.name || 'A definir'}</span>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700 }}>
                    {match.homeScore ?? '-'} x {match.awayScore ?? '-'}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{match.awayTeam?.name || 'A definir'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fixed Bottom Action */}
      <div style={{
        position: 'fixed',
        bottom: '64px', // above bottom nav
        left: 0,
        right: 0,
        padding: '1rem',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        zIndex: 90,
        maxWidth: '480px',
        margin: '0 auto',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
      }}>
        {!user ? (
          <button className="btn btn-primary w-full" onClick={() => navigate('/login')}>
            Entrar e se inscrever
          </button>
        ) : !myRegistration ? (
          <button 
            className="btn btn-primary w-full" 
            onClick={handleRegister} 
            disabled={registerMutation.isPending || event.status !== 'ACTIVE'}
            style={{ padding: '0.875rem' }}
          >
            {event.status !== 'ACTIVE' ? 'Inscrições Indisponíveis' : 'Confirmar Presença no Evento'}
          </button>
        ) : (
          <button 
            className="btn btn-secondary w-full" 
            onClick={handleCancel} 
            disabled={cancelMutation.isPending}
            style={{ padding: '0.875rem', color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)' }}
          >
            Cancelar Inscrição
          </button>
        )}
      </div>
    </div>
  );
}
