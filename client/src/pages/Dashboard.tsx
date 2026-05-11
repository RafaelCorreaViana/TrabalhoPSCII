import { useAuthStore } from '@/store/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Bem-vindo de volta, {user?.name}!</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Meus Eventos</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Minhas Equipes</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Próximas Partidas</h3>
          <p className="stat-value">0</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-activity">
          <h2>Atividade Recente</h2>
          <div className="empty-state">
            <p>Nenhuma atividade recente encontrada.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
