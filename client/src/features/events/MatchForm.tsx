import { useState } from 'react';
import { useCreateMatch } from '@/hooks/useMatches';
import Button from '@/components/ui/Button';

interface MatchFormProps {
  eventId: string;
  teams?: { id: string; name: string }[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MatchForm({ eventId, teams = [], onSuccess, onCancel }: MatchFormProps) {
  const createMatch = useCreateMatch(eventId);
  const [formData, setFormData] = useState({
    dateTime: '',
    notes: '',
    homeTeamId: '',
    awayTeamId: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.homeTeamId && formData.awayTeamId && formData.homeTeamId === formData.awayTeamId) {
      setError('Os times não podem ser iguais.');
      return;
    }

    try {
      await createMatch.mutateAsync({
        dateTime: formData.dateTime ? new Date(formData.dateTime).toISOString() : undefined,
        homeTeamId: formData.homeTeamId || undefined,
        awayTeamId: formData.awayTeamId || undefined,
        notes: formData.notes || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao agendar partida. Verifique se há conflito de horário.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="match-form">
      {error && <div className="error-alert">{error}</div>}

      <div className="form-grid-2col">
        <div className="form-group full-width">
          <label className="form-label">Data e Hora *</label>
          <input
            type="datetime-local"
            className="form-input"
            value={formData.dateTime}
            onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Time da Casa</label>
          <select
            className="form-input"
            value={formData.homeTeamId}
            onChange={(e) => setFormData({ ...formData, homeTeamId: e.target.value })}
          >
            <option value="">-- Selecionar Time --</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Time Visitante</label>
          <select
            className="form-input"
            value={formData.awayTeamId}
            onChange={(e) => setFormData({ ...formData, awayTeamId: e.target.value })}
          >
            <option value="">-- Selecionar Time --</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group full-width">
          <label className="form-label">Observações</label>
          <textarea
            className="form-input"
            style={{ minHeight: '60px' }}
            value={formData.notes}
            placeholder="Observações, quadra, etc."
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
      </div>

      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" isLoading={createMatch.isPending}>Agendar Partida</Button>
      </div>
    </form>
  );
}
