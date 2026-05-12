import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublicEvents } from '@/hooks/usePlayer';

const SPORTS = ['Todos', 'futsal', 'futebol', 'volei', 'basquete'];

export default function EventsDiscover() {
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading } = usePublicEvents({
    search: debouncedSearch || undefined,
    sport: sport || undefined,
  });

  const events: any[] = data?.events || [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    clearTimeout((window as any)._searchTimer);
    (window as any)._searchTimer = setTimeout(() => {
      setDebouncedSearch(e.target.value);
    }, 400);
  };

  return (
    <div className="discover-page">
      {/* Hero */}
      <div className="discover-hero">
        <h1>Descubra Eventos</h1>
        <p className="text-secondary">Encontre torneios e competições para participar.</p>

        <div className="discover-search-bar">
          <input
            className="search-input search-input-lg"
            placeholder="🔍 Buscar eventos por nome..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="sport-pills">
          {SPORTS.map((s) => (
            <button
              key={s}
              className={`sport-pill ${sport === (s === 'Todos' ? '' : s) ? 'active' : ''}`}
              onClick={() => setSport(s === 'Todos' ? '' : s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="discover-results">
        {isLoading ? (
          <div className="loading-state">Buscando eventos...</div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '3rem' }}>🏟️</p>
            <p style={{ marginTop: '1rem', fontWeight: 600 }}>Nenhum evento disponível no momento.</p>
            <p className="text-secondary" style={{ marginTop: '0.5rem' }}>Tente ajustar os filtros ou volte mais tarde.</p>
          </div>
        ) : (
          <>
            <p className="results-count">{events.length} evento{events.length !== 1 ? 's' : ''} encontrado{events.length !== 1 ? 's' : ''}</p>
            <div className="discover-grid">
              {events.map((ev) => (
                <Link to={`/discover/${ev.id}`} key={ev.id} className="discover-card">
                  <div className="discover-card-header">
                    <span className="sport-chip">{ev.sportType}</span>
                    <span className={`status-badge status-${ev.status.toLowerCase()}`}>
                      {ev.status === 'ACTIVE' ? 'Aberto' : 
                       ev.status === 'CLOSED' ? 'Encerrado' : 'Finalizado'}
                    </span>
                  </div>
                  <h3 className="discover-card-title">{ev.name}</h3>
                  {ev.description && (
                    <p className="discover-card-desc">{ev.description.slice(0, 100)}{ev.description.length > 100 ? '...' : ''}</p>
                  )}
                  <div className="discover-card-footer">
                    <div className="discover-card-meta">
                      {ev.startDate && (
                        <span>📅 {new Date(ev.startDate).toLocaleDateString('pt-BR')}</span>
                      )}
                      <span>👤 {ev.organizer.name}</span>
                      <span>👥 {ev._count.registrations} inscrito{ev._count.registrations !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="discover-join-hint">Ver detalhes →</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
