import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent, useUpdateEvent } from '@/hooks/useEvents';
import Button from '@/components/ui/Button';

const STATUS_OPTIONS = ['DRAFT', 'ACTIVE', 'CLOSED', 'FINISHED'];

export default function EventEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useEvent(id!);
  const updateEvent = useUpdateEvent();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sportType: 'futsal',
    maxParticipants: '',
    startDate: '',
    endDate: '',
    rules: '',
    status: 'DRAFT',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (data?.event) {
      const ev = data.event;
      setFormData({
        name: ev.name || '',
        description: ev.description || '',
        sportType: ev.sportType || 'futsal',
        maxParticipants: ev.maxParticipants?.toString() || '',
        startDate: ev.startDate ? new Date(ev.startDate).toISOString().slice(0, 16) : '',
        endDate: ev.endDate ? new Date(ev.endDate).toISOString().slice(0, 16) : '',
        rules: ev.rules || '',
        status: ev.status || 'DRAFT',
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await updateEvent.mutateAsync({
        id: id!,
        data: {
          ...formData,
          maxParticipants: formData.maxParticipants ? Number(formData.maxParticipants) : undefined,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        },
      });
      navigate(`/events/${id}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar alterações.');
    }
  };

  if (isLoading) return <div className="loading-state">Carregando evento...</div>;

  return (
    <div className="event-edit-page">
      <div className="page-header-row">
        <div>
          <h1>Editar Evento</h1>
          <p className="text-secondary">Atualize as informações do seu evento.</p>
        </div>
        <button className="btn btn-secondary btn-md" onClick={() => navigate(`/events/${id}`)}>
          ← Voltar
        </button>
      </div>

      {error && <div className="error-alert">{error}</div>}

      <form onSubmit={handleSubmit} className="event-form glass-panel">
        <div className="form-grid-2col">
          <div className="form-group">
            <label className="form-label">Nome do Evento *</label>
            <input
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome do evento"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" className="form-input" value={formData.status} onChange={handleChange}>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Esporte</label>
            <select name="sportType" className="form-input" value={formData.sportType} onChange={handleChange}>
              <option value="futsal">Futsal</option>
              <option value="futebol">Futebol</option>
              <option value="volei">Vôlei</option>
              <option value="basquete">Basquete</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Vagas Máximas</label>
            <input
              name="maxParticipants"
              type="number"
              className="form-input"
              value={formData.maxParticipants}
              onChange={handleChange}
              placeholder="Ex: 20"
              min={1}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Data de Início</label>
            <input
              name="startDate"
              type="datetime-local"
              className="form-input"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Data de Término</label>
            <input
              name="endDate"
              type="datetime-local"
              className="form-input"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Descrição</label>
            <textarea
              name="description"
              className="form-input"
              style={{ minHeight: '100px' }}
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva o evento, premiações, etc."
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Regras</label>
            <textarea
              name="rules"
              className="form-input"
              style={{ minHeight: '100px' }}
              value={formData.rules}
              onChange={handleChange}
              placeholder="Regras do torneio, etc."
            />
          </div>
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={() => navigate(`/events/${id}`)}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={updateEvent.isPending}>
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
