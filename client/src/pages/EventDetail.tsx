import { useParams, useNavigate } from 'react-router-dom';
import { useEvent, useDeleteEvent, useUpdateEvent } from '@/hooks/useEvents';
import { useDeleteMatch } from '@/hooks/useMatches';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import RegistrationsManager from '@/features/events/RegistrationsManager';
import MatchForm from '@/features/events/MatchForm';
import TeamManager from '@/features/events/TeamManager';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  ACTIVE: 'Ativo',
  CLOSED: 'Fechado',
  FINISHED: 'Finalizado',
};

type TabType = 'info' | 'registrations' | 'teams' | 'matches';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useEvent(id!);
  const deleteEvent = useDeleteEvent();
  const updateEvent = useUpdateEvent();
  const deleteMatch = useDeleteMatch(id!);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [showMatchForm, setShowMatchForm] = useState(false);

  if (isLoading) return <div className="loading-state">Carregando evento...</div>;
  if (error || !data?.event) return <div className="error-state">Evento não encontrado.</div>;

  const event = data.event;
  const matches = event.matches || [];
  const registrations = event.registrations || [];
  
  // Times oficiais do evento (agora com relação direta no DB)
  const officialTeams = event.teams || [];
  
  // Para compatibilidade, se houver times em matches que não estão em officialTeams (casos legados)
  const teamsFromMatches: any[] = [...officialTeams];
  const seenTeamIds = new Set<string>(officialTeams.map((t: any) => t.id));
  
  matches.forEach((m: any) => {
    if (m.homeTeam && !seenTeamIds.has(m.homeTeam.id)) {
      teamsFromMatches.push(m.homeTeam);
      seenTeamIds.add(m.homeTeam.id);
    }
    if (m.awayTeam && !seenTeamIds.has(m.awayTeam.id)) {
      teamsFromMatches.push(m.awayTeam);
      seenTeamIds.add(m.awayTeam.id);
    }
  });

  const handleDeleteEvent = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
      await deleteEvent.mutateAsync(id!);
      navigate('/events');
    } catch {
      alert('Erro ao excluir evento.');
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!window.confirm('Excluir esta partida?')) return;
    try {
      await deleteMatch.mutateAsync(matchId);
    } catch {
      alert('Erro ao excluir partida.');
    }
  };

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'info', label: 'Informações' },
    { key: 'registrations', label: 'Inscrições', count: registrations.length },
    { key: 'teams', label: 'Times' },
    { key: 'matches', label: 'Partidas', count: matches.length },
  ];

  return (
    <div className="event-detail-page">
      {/* Header */}
      <div className="event-detail-header">
        {/* Linha 1: Voltar + badges */}
        <div className="event-header-top-row">
          <button className="btn btn-secondary btn-sm back-btn" onClick={() => navigate('/events')}>
            ← Voltar
          </button>
          <div className="event-meta-row">
            <span className={`status-badge status-${event.status.toLowerCase()}`}>
              {STATUS_LABELS[event.status]}
            </span>
            <span className="sport-chip">{event.sportType}</span>
          </div>
        </div>

        {/* Linha 2: Título */}
        <h1>{event.name}</h1>

        {/* Linha 3: Botões de ação */}
        <div className="event-header-actions">
          {event.status === 'DRAFT' && (
            <Button
              variant="primary"
              onClick={() => updateEvent.mutate({ id: id!, data: { status: 'ACTIVE' } })}
              isLoading={updateEvent.isPending}
            >
              🚀 Publicar
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate(`/events/${id}/edit`)}>
            ✏️ Editar
          </Button>
          <Button variant="danger" onClick={handleDeleteEvent} isLoading={deleteEvent.isPending}>
            Excluir
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="event-stats-row">
        <div className="event-stat">
          <span className="stat-label">Inscritos</span>
          <span className="stat-val">{registrations.length}</span>
        </div>
        <div className="event-stat">
          <span className="stat-label">Confirmados</span>
          <span className="stat-val">{registrations.filter((r: any) => r.status === 'CONFIRMED').length}</span>
        </div>
        <div className="event-stat">
          <span className="stat-label">Partidas</span>
          <span className="stat-val">{matches.length}</span>
        </div>
        <div className="event-stat">
          <span className="stat-label">Vagas</span>
          <span className="stat-val">{event.maxParticipants ?? '∞'}</span>
        </div>
        {event.startDate && (
          <div className="event-stat">
            <span className="stat-label">Início</span>
            <span className="stat-val" style={{ fontSize: '0.95rem' }}>
              {new Date(event.startDate).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-panel">

        {/* INFO */}
        {activeTab === 'info' && (
          <div className="info-grid">
            <div className="info-block">
              <h3>Descrição</h3>
              <p className="info-text">{event.description || 'Nenhuma descrição fornecida.'}</p>
            </div>
            <div className="info-block">
              <h3>Regras</h3>
              <p className="info-text">{event.rules || 'Nenhuma regra definida.'}</p>
            </div>
          </div>
        )}

        {/* REGISTRATIONS */}
        {activeTab === 'registrations' && (
          <div>
            <div className="section-header">
              <h3>Gerenciar Inscrições</h3>
              <p className="text-secondary">Aprove ou rejeite os jogadores inscritos neste evento.</p>
            </div>
            <RegistrationsManager eventId={id!} />
          </div>
        )}

        {/* TEAMS */}
        {activeTab === 'teams' && (
          <div>
            <div className="section-header">
              <h3>Gestão de Times</h3>
              <p className="text-secondary">Crie times e aloque jogadores confirmados.</p>
            </div>
            <TeamManager eventId={id!} eventTeams={teamsFromMatches} />
          </div>
        )}

        {/* MATCHES */}
        {activeTab === 'matches' && (
          <div>
            <div className="section-header-row">
              <div>
                <h3>Partidas Agendadas</h3>
                <p className="text-secondary">Crie e gerencie as partidas do torneio.</p>
              </div>
              <Button size="small" onClick={() => setShowMatchForm(true)}>
                + Agendar Partida
              </Button>
            </div>

            {showMatchForm && (
              <div className="match-form-wrapper">
                <h4>Nova Partida</h4>
                <MatchForm
                  eventId={id!}
                  teams={teamsFromMatches}
                  onSuccess={() => setShowMatchForm(false)}
                  onCancel={() => setShowMatchForm(false)}
                />
              </div>
            )}

            {matches.length === 0 ? (
              <div className="empty-state">
                <p style={{ fontSize: '2.5rem' }}>🏟️</p>
                <p style={{ marginTop: '0.75rem' }}>Nenhuma partida agendada ainda.</p>
              </div>
            ) : (
              <div className="matches-list">
                {matches.map((match: any) => (
                  <div key={match.id} className="match-card">
                    <div className="match-datetime">
                      {match.dateTime
                        ? new Date(match.dateTime).toLocaleString('pt-BR')
                        : 'Data não definida'}
                    </div>
                    <div className="match-teams">
                      <span className="team-name-display">{match.homeTeam?.name || '—'}</span>
                      <div className="score-block">
                        <span className="score">{match.homeScore ?? '—'}</span>
                        <span className="score-sep">:</span>
                        <span className="score">{match.awayScore ?? '—'}</span>
                      </div>
                      <span className="team-name-display">{match.awayTeam?.name || '—'}</span>
                    </div>
                    {match.notes && <p className="match-notes">{match.notes}</p>}
                    <div className="match-actions">
                      <span className={`status-badge status-${match.status.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                        {match.status}
                      </span>
                      <Button
                        size="small"
                        variant="danger"
                        onClick={() => handleDeleteMatch(match.id)}
                        isLoading={deleteMatch.isPending}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}