import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEvents, useDeleteEvent } from '@/hooks/useEvents';
import { useAuthStore } from '@/store/authStore';
import { Plus, Trophy, Users, Search } from 'lucide-react';

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
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [search, setSearch] = useState('');

  const allEvents: any[] = data?.events || [];

  const filtered = allEvents.filter((ev) => {
    const matchesStatus = statusFilter === 'TODOS' || ev.status === statusFilter;
    const matchesSearch = ev.name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Gestão de Eventos</h1>
          <p className="page-subtitle">Cadastre e gerencie eventos esportivos</p>
        </div>
        {user?.role === 'ORGANIZER' && (
          <Link to="/events/new" className="btn btn-primary" style={{ padding: '0.6rem 1rem', borderRadius: '12px' }}>
            <Plus size={18} /> Novo Evento
          </Link>
        )}
      </div>

      {/* Filters (Horizontal Scroll) */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
        <div style={{ position: 'relative', minWidth: '180px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: '36px', borderRadius: '999px', padding: '8px 16px 8px 36px', fontSize: '0.85rem' }}
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {STATUS_FILTER_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className="badge"
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              background: statusFilter === s ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: statusFilter === s ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${statusFilter === s ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              whiteSpace: 'nowrap'
            }}
          >
            {s === 'TODOS' ? 'Todos' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="section-title">Eventos Cadastrados</div>

      {/* Content */}
      {isLoading ? (
        <div className="loading-state">Carregando eventos...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏅</p>
          <p style={{ fontWeight: 600 }}>Nenhum evento encontrado.</p>
        </div>
      ) : (
        <div className="events-grid">
          {filtered.map((ev) => {
            const confirmedCount = ev.registrations?.filter((r: any) => r.status === 'CONFIRMED').length || 0;
            const max = ev.maxParticipants || '∞';
            
            return (
              <div 
                key={ev.id} 
                className="card" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '1rem', 
                  gap: '1rem',
                  borderColor: ev.status === 'ACTIVE' ? 'var(--accent-primary)' : 'var(--border-color)',
                  background: ev.status === 'ACTIVE' ? 'var(--accent-primary)05' : 'var(--bg-card)',
                }}
                onClick={() => navigate(`/events/${ev.id}`)}
              >
                <div style={{ 
                  width: '48px', height: '48px', 
                  borderRadius: '12px', 
                  background: 'rgba(37,99,235,0.1)', 
                  color: 'var(--accent-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Trophy size={24} />
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ev.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', textTransform: 'capitalize' }}>
                    {ev.sportType}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <Users size={12} /> {confirmedCount} / {max}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
