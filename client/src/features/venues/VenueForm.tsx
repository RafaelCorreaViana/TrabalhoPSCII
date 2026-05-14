import { useForm } from 'react-hook-form';
import { useVenues } from '@/hooks/useVenues';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface VenueFormProps {
  onClose: () => void;
}

const SPORT_TYPES = ['futsal', 'society', 'tênis', 'basquete', 'vôlei', 'natação'];

interface VenueFormData {
  name: string;
  address: string;
  sportType: string;
  capacity?: string | number;
  description?: string;
}

export default function VenueForm({ onClose }: VenueFormProps) {
  const { createVenue } = useVenues();
  const { register, handleSubmit, formState: { errors } } = useForm<VenueFormData>({
    defaultValues: { sportType: 'futsal' }
  });

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        capacity: data.capacity ? Number(data.capacity) : undefined,
      };
      await createVenue.mutateAsync(payload);
      toast.success('Local cadastrado com sucesso!');
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao cadastrar local.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0 }}>Cadastrar Novo Local</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Nome do Local *</label>
            <input
              {...register('name', { required: 'Nome é obrigatório' })}
              className="form-input"
              placeholder="Ex: Arena Soccer Pro"
            />
            {errors.name && <span style={{ color: 'var(--accent-danger)', fontSize: '0.8rem' }}>{errors.name.message as string}</span>}
          </div>

          <div>
            <label className="form-label">Endereço *</label>
            <input
              {...register('address', { required: 'Endereço é obrigatório' })}
              className="form-input"
              placeholder="Rua, Número, Bairro, Cidade"
            />
            {errors.address && <span style={{ color: 'var(--accent-danger)', fontSize: '0.8rem' }}>{errors.address.message as string}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="form-label">Tipo de Esporte *</label>
              <select {...register('sportType')} className="form-input">
                {SPORT_TYPES.map(s => (
                  <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Capacidade (pessoas)</label>
              <input
                type="number"
                {...register('capacity')}
                className="form-input"
                placeholder="Ex: 50"
                min={1}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Descrição</label>
            <textarea
              {...register('description')}
              className="form-input"
              rows={3}
              placeholder="Informe detalhes sobre o local, infraestrutura, etc."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={createVenue.isPending}>
              {createVenue.isPending ? 'Salvando...' : 'Cadastrar Local'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
