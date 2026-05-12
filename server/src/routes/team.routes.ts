import { Router } from 'express';
import { createTeam, addTeamMember } from '../controllers/team.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireRole(['ORGANIZER']));

router.post('/', createTeam);
router.post('/:id/members', addTeamMember);

export default router;
