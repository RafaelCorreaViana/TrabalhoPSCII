import { Router } from 'express';
import { updateBookingStatus } from '../controllers/booking.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// PATCH /api/bookings/:id/status — aprovar / rejeitar (admin do local)
router.patch('/:id/status', requireAuth, updateBookingStatus);

export default router;
