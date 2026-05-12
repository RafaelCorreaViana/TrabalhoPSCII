import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateEvent } from '@/hooks/useEvents';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Converte data para formato ISO se houver
      const dataToSend = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        maxParticipants: Number(formData.maxParticipants),
      };
      
      await createEvent.mutateAsync(dataToSend);
      navigate('/');
    } catch (error) {
      console.error('Erro ao criar evento:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="page-container max-w-2xl mx-auto">
      <div className="page-header mb-8">
        <h1>Criar Novo Evento</h1>
        <p className="text-secondary">Preencha os detalhes do seu evento esportivo.</p>
      </div>

      <form onSubmit={handleSubmit} className="form-card glass-panel p-8">
        <div className="form-grid">
          <Input
            label="Nome do Evento"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Torneio de Futsal da Amizade"
            required
          />

          <div className="form-group">
            <label className="form-label">Tipo de Esporte</label>
            <select 
              name="sportType" 
              value={formData.sportType} 
              onChange={handleChange}
              className="form-input"
            >
              <option value="futsal">Futsal</option>
              <option value="futebol">Futebol</option>
              <option value="volei">Vôlei</option>
            </select>
          </div>

          <Input
            label="Data de Início"
            name="startDate"
            type="datetime-local"
            value={formData.startDate}
            onChange={handleChange}
            required
          />

          <Input
            label="Vagas (Máx. Participantes)"
            name="maxParticipants"
            type="number"
            value={formData.maxParticipants.toString()}
            onChange={handleChange}
            required
          />

          <div className="form-group full-width">
            <label className="form-label">Descrição</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input min-h-[100px]"
              placeholder="Descreva o evento, premiações, etc."
            />
          </div>

          <div className="form-group full-width">
            <label className="form-label">Regras</label>
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              className="form-input min-h-[100px]"
              placeholder="Regras do torneio, tempo de jogo, etc."
            />
          </div>
        </div>

        <div className="form-actions mt-8 flex gap-4">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => navigate('/')}
            disabled={createEvent.isPending}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            isLoading={createEvent.isPending}
          >
            Criar Evento
          </Button>
        </div>
      </form>
    </div>
  );
}
