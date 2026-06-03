import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVenueById } from '@/hooks/useVenues';
import { useBookings } from '@/hooks/useBookings';
import { useAuthStore } from '@/store/authStore';
import { MapPin, Users, ArrowLeft, Calendar, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import '@/styles/phase5.css';

const SPORT_ICON: Record<string, string> = {
  futsal: '⚽',
  society: '⛳',
  tênis: '🎾',
  basquete: '🏀',
  vôlei: '🏐',
  natação: '🏊',
};

export default function VenueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const venueQuery = useVenueById(id!);
  const { getVenueBookings, createBooking, updateBookingStatus } = useBookings(id);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({ date: '', startHour: '08', endHour: '09' });
  
  const [currentDate, setCurrentDate] = useState(new Date());

  const venue = venueQuery.data;
  const bookings = getVenueBookings.data ?? [];

  const isAdmin = venue?.adminId === user?.id;

  const handleBook = async () => {
    if (!bookingData.date) {
      toast.error('Selecione uma data.');
      return;
    }
    const startTime = `${bookingData.date}T${bookingData.startHour}:00:00.000Z`;
    const endTime = `${bookingData.date}T${bookingData.endHour}:00:00.000Z`;

    try {
      await createBooking.mutateAsync({ venueId: id!, startTime, endTime });
      toast.success('Reserva solicitada! Aguardando aprovação.');
      setShowBookingForm(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao solicitar reserva.');
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: 'CONFIRMED' | 'REJECTED' | 'CANCELLED') => {
    try {
      await updateBookingStatus.mutateAsync({ id: bookingId, status });
      toast.success(status === 'CONFIRMED' ? 'Reserva confirmada!' : 'Reserva rejeitada.');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Erro ao atualizar reserva.');
    }
  };

  if (venueQuery.isLoading) {
    return <div className="loading-state">Carregando local...</div>;
  }

  if (!venue) {
    return <div className="empty-state card">Local não encontrado.</div>;
  }

  const pending = bookings.filter(b => b.status === 'PENDING');
  const confirmed = bookings.filter(b => b.status === 'CONFIRMED');

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startPadding = firstDay.getDay(); 
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    const remainingDays = (days.length > 35 ? 42 : 35) - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const calendarDays = getDaysInMonth(currentDate);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="venues-container animate-fade-in">
      {/* Back */}
      <button
        className="btn btn-secondary"
        style={{ marginBottom: '1.5rem', gap: '0.5rem' }}
        onClick={() => navigate('/venues')}
      >
        <ArrowLeft size={16} /> Voltar aos Locais
      </button>

      {/* Header info - AJUSTADO PARA RESPONSIVIDADE MOBILE */}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }} className="venue-detail-header">
        <div className="card" style={{ padding: '1.5rem', flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>{SPORT_ICON[venue.sportType] ?? '🏟️'}</span>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{venue.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                <MapPin size={14} />
                <span>{venue.address}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span className="badge" style={{ textTransform: 'capitalize', background: 'var(--accent-primary)20', color: 'var(--accent-primary)' }}>
              {venue.sportType}
            </span>
            {venue.capacity && (
              <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={12} /> {venue.capacity} pessoas
              </span>
            )}
          </div>

          {venue.description && (
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{venue.description}</p>
          )}

          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            Administrado por <strong>{venue.admin?.name}</strong>
          </div>
        </div>

        {/* Stats - AJUSTADO PARA EM COMPALIBILIDADE SE AJUSTAR LADO A LADO SEM CORTES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minWidth: '140px' }}>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{confirmed.length}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Reservas Confirmadas</div>
          </div>
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-warning)' }}>{pending.length}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Aguardando Aprovação</div>
          </div>
          {!isAdmin && (
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
              onClick={() => setShowBookingForm(true)}
            >
              <Calendar size={18} /> Solicitar Reserva
            </button>
          )}
        </div>
      </div>

      {/* Admin: pendentes */}
      {isAdmin && pending.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} /> Solicitações Pendentes ({pending.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pending.map(b => (
              <div key={b.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: '8px', flexWrap: 'wrap', gap: '0.5rem'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{b.bookedBy?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(b.startTime).toLocaleDateString('pt-BR')} •{' '}
                    {new Date(b.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} –{' '}
                    {new Date(b.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}
                    onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                    disabled={updateBookingStatus.isPending}
                  >
                    <CheckCircle size={14} /> Confirmar
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px', color: 'var(--accent-danger)' }}
                    onClick={() => handleUpdateStatus(b.id, 'REJECTED')}
                    disabled={updateBookingStatus.isPending}
                  >
                    <XCircle size={14} /> Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendário Mensal de Reservas - AJUSTADO O CORPO DO HEADER PARA QUEBRA EM TELAS PEQUENAS */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} /> Agenda de Reservas
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '0.25rem' }}>
              <button className="btn-icon" onClick={prevMonth}>&lt;</button>
              <span style={{ minWidth: '120px', textAlign: 'center', fontWeight: 600 }}>
                {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
              </span>
              <button className="btn-icon" onClick={nextMonth}>&gt;</button>
            </div>
            {!isAdmin && (
              <button className="btn btn-primary" style={{ gap: '0.5rem', fontSize: '0.875rem' }} onClick={() => setShowBookingForm(true)}>
                <Plus size={16} /> Nova Reserva
              </button>
            )}
          </div>
        </div>

        {getVenueBookings.isLoading ? (
          <div className="loading-state">Carregando calendário...</div>
        ) : (
          <div className="calendar-container" style={{ marginTop: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="calendar-grid">
              {calendarDays.map((day, idx) => {
                const dayBookings = bookings.filter(b => {
                  const bDate = new Date(b.startTime);
                  return bDate.getDate() === day.date.getDate() && bDate.getMonth() === day.date.getMonth() && bDate.getFullYear() === day.date.getFullYear();
                });

                const isToday = new Date().toDateString() === day.date.toDateString();

                return (
                  <div key={idx} className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}>
                    <div style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px', color: isToday ? 'var(--accent-primary)' : 'inherit' }}>
                      {day.date.getDate()}
                    </div>
                    <div>
                      {dayBookings.map(b => (
                        <div key={b.id} className={`booking-item ${b.status === 'CONFIRMED' ? 'booking-confirmed' : b.status === 'PENDING' ? 'booking-pending' : ''}`} style={{ background: b.status === 'CONFIRMED' ? 'var(--accent-primary)20' : b.status === 'PENDING' ? 'var(--accent-warning)20' : 'transparent', color: b.status === 'CONFIRMED' ? 'var(--accent-primary)' : b.status === 'PENDING' ? 'var(--accent-warning)' : 'inherit', border: 'none', marginBottom: '4px' }}>
                          <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700 }}>
                            {new Date(b.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span style={{ fontSize: '0.7rem' }}>{b.bookedBy?.name.split(' ')[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowBookingForm(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Solicitar Reserva</h3>
              <button onClick={() => setShowBookingForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Data *</label>
                <input
                  type="date"
                  className="form-input"
                  value={bookingData.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setBookingData(p => ({ ...p, date: e.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Horário de Início</label>
                  <select className="form-input" value={bookingData.startHour} onChange={e => setBookingData(p => ({ ...p, startHour: e.target.value }))}>
                    {Array.from({ length: 16 }, (_, i) => i + 6).map(h => (
                      <option key={h} value={String(h).padStart(2, '0')}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Horário de Término</label>
                  <select className="form-input" value={bookingData.endHour} onChange={e => setBookingData(p => ({ ...p, endHour: e.target.value }))}>
                    {Array.from({ length: 16 }, (_, i) => i + 7).map(h => (
                      <option key={h} value={String(h).padStart(2, '0')}>{String(h).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                ℹ️ Sua solicitação será enviada ao administrador do local para aprovação.
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowBookingForm(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleBook} disabled={createBooking.isPending}>
                  {createBooking.isPending ? 'Enviando...' : 'Solicitar Reserva'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}