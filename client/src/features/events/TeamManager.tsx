import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi, registrationsApi } from '@/lib/api';
import Button from '@/components/ui/Button';

interface TeamManagerProps {
  eventId: string;
  eventTeams?: { id: string; name: string; members: any[] }[];
}

export default function TeamManager({ eventId, eventTeams = [] }: TeamManagerProps) {
  const queryClient = useQueryClient();
  const [newTeamName, setNewTeamName] = useState('');
  const [assigningPlayer, setAssigningPlayer] = useState<{ playerId: string; playerName: string } | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const { data: regData } = useQuery({
    queryKey: ['registrations', eventId],
    queryFn: () => registrationsApi.getAllByEvent(eventId),
  });

  const createTeamMutation = useMutation({
    mutationFn: (name: string) => teamsApi.create({ name }),
    onSuccess: () => {
      setNewTeamName('');
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });

  const addMemberMutation = useMutation({
    mutationFn: ({ teamId, playerId }: { teamId: string; playerId: string }) =>
      teamsApi.addMember(teamId, playerId),
    onSuccess: () => {
      setAssigningPlayer(null);
      setSelectedTeamId('');
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['registrations', eventId] });
    },
    onError: (err: any) => {
      alert(err.message || 'Erro ao alocar jogador.');
    },
  });

  const confirmedPlayers = (regData?.registrations || []).filter((r: any) => r.status === 'CONFIRMED');

  return (
    <div className="team-manager">
      {/* Criar Time */}
      <div className="create-team-section glass-panel-inner">
        <h4>Criar Novo Time</h4>
        <div className="inline-form">
          <input
            className="form-input"
            placeholder="Nome do time (Ex: Relâmpagos)"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (newTeamName.trim()) createTeamMutation.mutate(newTeamName.trim());
              }
            }}
          />
          <Button
            onClick={() => createTeamMutation.mutate(newTeamName.trim())}
            isLoading={createTeamMutation.isPending}
            disabled={!newTeamName.trim()}
          >
            Criar Time
          </Button>
        </div>
      </div>

      {/* Times Existentes */}
      {eventTeams.length > 0 && (
        <div className="teams-existing">
          <h4>Times Criados</h4>
          <div className="teams-cards-grid">
            {eventTeams.map((team) => (
              <div key={team.id} className="team-card glass-panel-inner">
                <div className="team-card-header">
                  <span className="team-icon">⚽</span>
                  <span className="team-name">{team.name}</span>
                  <span className="team-count">{team.members?.length || 0}/5</span>
                </div>
                {team.members && team.members.length > 0 ? (
                  <ul className="members-list">
                    {team.members.map((m: any) => (
                      <li key={m.id}>{m.player?.name || 'Jogador'}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-members">Nenhum jogador ainda</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alocar Jogadores */}
      <div className="allocate-section">
        <h4>Alocar Jogadores Aprovados</h4>
        <p className="text-secondary text-sm">
          Apenas jogadores com inscrição <strong>CONFIRMADA</strong> aparecem aqui.
        </p>

        {confirmedPlayers.length === 0 ? (
          <div className="empty-state-small">
            Nenhum jogador confirmado disponível para alocação.
          </div>
        ) : (
          <div className="players-allocation-list">
            {confirmedPlayers.map((reg: any) => (
              <div key={reg.id} className="player-allocation-row">
                <div className="player-identity">
                  <div className="player-avatar">{reg.player.name[0].toUpperCase()}</div>
                  <div>
                    <p className="player-fullname">{reg.player.name}</p>
                    <p className="player-email">{reg.player.email}</p>
                  </div>
                </div>

                {reg.teamId ? (
                  <span className="already-allocated">
                    ✅ {eventTeams.find(t => t.id === reg.teamId)?.name || 'Time alocado'}
                  </span>
                ) : assigningPlayer?.playerId === reg.playerId ? (
                  <div className="assign-form">
                    <select
                      className="form-input form-input-sm"
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                    >
                      <option value="">Selecionar time...</option>
                      {eventTeams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <Button
                      size="small"
                      onClick={() => addMemberMutation.mutate({ teamId: selectedTeamId, playerId: reg.playerId })}
                      disabled={!selectedTeamId}
                      isLoading={addMemberMutation.isPending}
                    >
                      Alocar
                    </Button>
                    <Button size="small" variant="secondary" onClick={() => setAssigningPlayer(null)}>
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => {
                      setAssigningPlayer({ playerId: reg.playerId, playerName: reg.player.name });
                      setSelectedTeamId('');
                    }}
                    disabled={eventTeams.length === 0}
                  >
                    {eventTeams.length === 0 ? 'Crie um time primeiro' : 'Alocar em Time'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
