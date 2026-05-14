import { useState } from 'react';
import { useVenues, Venue } from '@/hooks/useVenues';
import { Plus, MapPin, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VenueForm from '@/features/venues/VenueForm';
import '@/styles/phase5.css';

const SPORT_ICON: Record<string, string> = {
  futsal: '⚽',
  society: '⛳',
  tênis: '🎾',
  basquete: '🏀',
  vôlei: '🏐',
  natação: '🏊',
};

const SPORT_COLORS: Record<string, string> = {
  futsal: '#22c55e',
  society: '#3b82f6',
  tênis: '#f59e0b',
  basquete: '#f97316',
  vôlei: '#8b5cf6',
  natação: '#06b6d4',
};

export default function Venues() {
  const navigate = useNavigate();
  const { getVenues } = useVenues();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVenues = getVenues.data?.filter((v: Venue) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="venues-container animate-fade-in">
      <div className="venues-header">
        <div>
          <h1 className="page-title">Locais e Quadras</h1>
          <p className="page-subtitle">Encontre e reserve o melhor lugar para sua partida</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Cadastrar Local
        </button>
      </div>

      <div style={{ marginBottom: '2rem', maxWidth: '500px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Buscar por nome ou endereço..."
            className="form-input"
            style={{ paddingLeft: '40px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {getVenues.isLoading ? (
        <div className="loading-state">Carregando locais...</div>
      ) : !filteredVenues?.length ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏟️</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Nenhum local encontrado</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Seja o primeiro a cadastrar um local esportivo!</p>
        </div>
      ) : (
        <div className="venue-grid">
          {filteredVenues.map((venue: Venue) => {
            const color = SPORT_COLORS[venue.sportType] ?? '#6b7280';
            return (
              <div
                key={venue.id}
                className="venue-card"
                onClick={() => navigate(`/venues/${venue.id}`)}
              >
                <div style={{
                  height: '120px',
                  background: `linear-gradient(135deg, ${color}33, ${color}11)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3.5rem',
                }}>
                  {SPORT_ICON[venue.sportType] ?? '🏟️'}
                </div>
                <div className="venue-content">
                  <h3 style={{ margin: '0 0 0.4rem' }}>{venue.name}</h3>
                  <div className="venue-address">
                    <MapPin size={13} />
                    <span>{venue.address}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                    <span className="badge" style={{ textTransform: 'capitalize', background: `${color}20`, color }}>
                      {venue.sportType}
                    </span>
                    {venue.capacity && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={12} /> {venue.capacity} pessoas
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <VenueForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
