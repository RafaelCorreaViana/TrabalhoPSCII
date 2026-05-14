import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEvents, useDeleteEvent } from '@/hooks/useEvents';
import { useAuthStore } from '@/store/authStore';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  ACTIVE: 'Ativo',
  CLOSED: 'Fechado',
  FINISHED: 'Finalizado',
};

const STATUS_FILTER_OPTIONS = ['TODOS', 'DRAFT', 'ACTIVE', 'CLOSED', 'FINISHED'];

export default function EventsList() {
  const { user } = useAuthStore();
  const { data, isLoading } = useEvents();
  const deleteEvent = useDeleteEvent();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [search, setSearch] = useState('');

  const allEvents: any[] = data?.events || [];

  const filtered = allEvents.filter((ev) => {
    const matchesStatus = statusFilter === 'TODOS' || ev.status === statusFilter;
    const matchesSearch = ev.name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Excluir o evento "${name}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteEvent.mutateAsync(id);
    } catch {
      alert('Erro ao excluir evento.');
    }
  };

  return (
    <div className="events-list-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1>Meus Eventos</h1>
          <p className="text-secondary">Gerencie os eventos que você organizou.</p>
        </div>
        {user?.role === 'ORGANIZER' && (
          <Link to="/events/new" className="btn btn-primary btn-md">
            + Criar Evento
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          className="search-input"
          placeholder="🔍 Buscar evento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="status-filters">
          {STATUS_FILTER_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
            >
              {s === 'TODOS' ? 'Todos' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="loading-state">Carregando eventos...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p style={{ fontSize: '3rem' }}>🏆</p>
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>
            {allEvents.length === 0 ? 'Nenhum evento criado ainda.' : 'Nenhum evento encontrado com esse filtro.'}
          </p>
          {user?.role === 'ORGANIZER' && allEvents.length === 0 && (
            <Link to="/events/new" className="btn btn-primary btn-md" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
              Criar meu primeiro evento
            </Link>
          )}
        </div>
      ) : (
        <div className="events-table-container">
          <table className="events-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Esporte</th>
                <th>Status</th>
                <th>Início</th>
                <th>Inscritos</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => (
                <tr key={ev.id} className="event-row">
                  <td className="event-name-cell">
                    <Link to={`/events/${ev.id}`}>{ev.name}</Link>
                  </td>
                  <td>
                    <span className="sport-chip">{ev.sportType}</span>
                  </td>
                  <td>
                    <span className={`status-badge status-${ev.status.toLowerCase()}`}>
                      {STATUS_LABELS[ev.status]}
                    </span>
                  </td>
                  <td className="text-secondary text-sm">
                    {ev.startDate ? new Date(ev.startDate).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="text-center">
                    {ev.registrations?.length ?? '—'}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/events/${ev.id}`)}
                      >
                        Gerenciar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(ev.id, ev.name)}
                        disabled={deleteEvent.isPending}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
