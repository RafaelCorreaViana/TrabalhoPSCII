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
      <div className="registration-list flex flex-col gap-4">
        {registrations.length === 0 ? (
          <p className="text-center py-8 opacity-50">Nenhum jogador inscrito neste evento ainda.</p>
        ) : (
          registrations.map((reg: any) => (
            <div key={reg.id} className="registration-item glass-panel p-4 flex justify-between items-center bg-bg-tertiary">
              <div className="player-info">
                <p className="font-bold">{reg.player.name}</p>
                <p className="text-xs text-secondary">{reg.player.email}</p>
                <span className={`badge badge-${reg.status.toLowerCase()} mt-2 inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded`}>
                  {reg.status}
                </span>
              </div>
              <div className="actions flex gap-2">
                {reg.status === 'PENDING' && (
                  <>
                    <Button 
                      size="small" 
                      onClick={() => handleStatusUpdate(reg.id, 'CONFIRMED')}
                      isLoading={updateStatus.isPending}
                    >
                      Aprovar
                    </Button>
                    <Button 
                      size="small" 
                      variant="danger" 
                      onClick={() => handleStatusUpdate(reg.id, 'REJECTED')}
                      isLoading={updateStatus.isPending}
                    >
                      Rejeitar
                    </Button>
                  </>
                )}
                {reg.status !== 'PENDING' && (
                  <Button 
                    size="small" 
                    variant="secondary"
                    onClick={() => handleStatusUpdate(reg.id, 'PENDING')}
                    isLoading={updateStatus.isPending}
                  >
                    Mudar para Pendente
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
