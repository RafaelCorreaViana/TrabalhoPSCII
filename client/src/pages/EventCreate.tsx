import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEvent } from '@/hooks/useEvents';
import { ArrowLeft } from 'lucide-react';

export default function EventCreate() {
  const navigate = useNavigate();
  const createEvent = useCreateEvent();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sportType: 'futsal',
    maxParticipants: 10,
    startDate: '',
    rules: '',
    status: 'DRAFT',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        maxParticipants: Number(formData.maxParticipants),
      };
      
      await createEvent.mutateAsync(dataToSend);
      navigate('/events');
    } catch (error) {
      console.error('Erro ao criar evento:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '20px' }}>
      <button className="btn-icon" onClick={() => navigate('/events')} style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={20} />
      </button>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Novo Evento</h1>
        <p className="page-subtitle">Configure os detalhes do seu torneio ou partida</p>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="form-group">
            <label className="form-label">Nome do Evento *</label>
            <input
              className="form-input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Torneio de Futsal da Amizade"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Esporte *</label>
              <select 
                className="form-input"
                name="sportType" 
                value={formData.sportType} 
                onChange={handleChange}
              >
                <option value="futsal">Futsal</option>
                <option value="futebol">Futebol</option>
                <option value="volei">Vôlei</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Vagas (Máx) *</label>
              <input
                className="form-input"
                name="maxParticipants"
                type="number"
                min="2"
                value={formData.maxParticipants}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Data de Início *</label>
            <input
              className="form-input"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: '12px' }}>
            <input
              type="checkbox"
              id="publishImmediately"
              checked={formData.status === 'ACTIVE'}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'ACTIVE' : 'DRAFT' }))}
              style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)', flexShrink: 0 }}
            />
            <label htmlFor="publishImmediately" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer', lineHeight: 1.4 }}>
              Publicar evento imediatamente <span style={{ color: 'var(--text-secondary)' }}>(ficará visível para jogadores)</span>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Descrição</label>
            <textarea
              className="form-input"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Descreva o evento, premiações, etc."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Regras</label>
            <textarea
              className="form-input"
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              rows={3}
              placeholder="Regras do torneio, tempo de jogo, etc."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ flex: 1 }}
              onClick={() => navigate('/events')}
              disabled={createEvent.isPending}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={createEvent.isPending}
            >
              {createEvent.isPending ? 'Criando...' : 'Criar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
