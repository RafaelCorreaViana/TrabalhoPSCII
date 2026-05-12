import { Router } from 'express';
import { getEventRegistrations, updateRegistrationStatus } from '../controllers/registration.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireRole(['ORGANIZER']));

// Montado em /api/events/:eventId/registrations
router.get('/', getEventRegistrations);

// Montado em /api/registrations
router.put('/:id/status', updateRegistrationStatus);

export default router;
