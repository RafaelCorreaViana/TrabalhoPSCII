import { Router } from 'express';
import {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  deleteVenue,
} from '../controllers/venue.controller';
import { getVenueBookings, createBooking } from '../controllers/booking.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Listagem pública
router.get('/', getVenues);
router.get('/:id', getVenueById);

// Apenas Organizadores ou Admin de Locais podem criar/editar
router.post('/', requireAuth, requireRole(['ORGANIZER', 'VENUE_ADMIN']), createVenue);
router.put('/:id', requireAuth, requireRole(['ORGANIZER', 'VENUE_ADMIN']), updateVenue);
router.delete('/:id', requireAuth, requireRole(['ORGANIZER', 'VENUE_ADMIN']), deleteVenue);

// Rotas de reserva aninhadas no local
router.get('/:id/bookings', getVenueBookings);
router.post('/:id/bookings', requireAuth, createBooking);

export default router;
