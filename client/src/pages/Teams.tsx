import { usePlayerTeams } from '@/hooks/usePlayer';
import { Users } from 'lucide-react';

export default function Teams() {
  const { data, isLoading } = usePlayerTeams();
  const teams: any[] = data?.teams || [];

  return (
    <div className="teams-page">
      <div className="page-header">
        <h1>Minhas Equipes</h1>
        <p className="text-secondary">Visualize as equipes que você faz parte e seus companheiros.</p>
      </div>

      {isLoading ? (
        <div className="loading-state">Carregando equipes...</div>
      ) : teams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Users size={48} /></div>
          <h3>Nenhuma equipe encontrada</h3>
          <p className="text-secondary">Você será adicionado a uma equipe pelo organizador após sua inscrição ser confirmada em um evento.</p>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <div key={team.id} className="team-card glass-panel">
              <div className="team-card-header">
                <h3>{team.name}</h3>
                <span className="badge">{team._count?.members || 0} Membros</span>
              </div>
              
              <div className="team-members-list">
                <h4>Membros:</h4>
                <div className="members-avatars">
                  {team.members?.map((m: any) => (
                    <div key={m.id} className="member-item" title={m.player.name}>
                      <div className="member-avatar-small">
                        {m.player.name[0].toUpperCase()}
                      </div>
                      <span className="member-name">{m.player.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
