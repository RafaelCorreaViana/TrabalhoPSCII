import { useRegistrations, useUpdateRegistrationStatus } from '@/hooks/useRegistrations';
import Button from '@/components/ui/Button';

interface RegistrationsManagerProps {
  eventId: string;
}

export default function RegistrationsManager({ eventId }: RegistrationsManagerProps) {
  const { data, isLoading } = useRegistrations(eventId);
  const updateStatus = useUpdateRegistrationStatus(eventId);

  if (isLoading) return <div>Carregando inscritos...</div>;

  const registrations = data?.registrations || [];

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  return (
    <div className="registrations-manager">
      <div className="registration-list flex flex-col" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {registrations.length === 0 ? (
          <p className="text-center py-8 opacity-50">Nenhum jogador inscrito neste evento ainda.</p>
        ) : (
          registrations.map((reg: any) => (
            <div key={reg.id} className="registration-item glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Info do jogador */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, margin: 0 }}>{reg.player.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0', wordBreak: 'break-all' }}>{reg.player.email}</p>
                </div>
                <span className={`badge badge-${reg.status.toLowerCase()}`} style={{ flexShrink: 0, fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: 'var(--bg-tertiary)', border: '1px solid var(--glass-border)' }}>
                  {reg.status}
                </span>
              </div>
              {/* Botões */}
              <div style={{ display: 'grid', gridTemplateColumns: reg.status === 'PENDING' ? '1fr 1fr' : '1fr', gap: '0.5rem' }}>
                {reg.status === 'PENDING' && (
                  <>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStatusUpdate(reg.id, 'CONFIRMED')}
                      disabled={updateStatus.isPending}
                    >
                      ✓ Aprovar
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleStatusUpdate(reg.id, 'REJECTED')}
                      disabled={updateStatus.isPending}
                    >
                      ✕ Rejeitar
                    </button>
                  </>
                )}
                {reg.status !== 'PENDING' && (
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleStatusUpdate(reg.id, 'PENDING')}
                    disabled={updateStatus.isPending}
                  >
                    Mudar para Pendente
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}