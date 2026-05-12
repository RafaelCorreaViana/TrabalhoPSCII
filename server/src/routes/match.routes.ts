import { Router } from 'express';
import { createMatch, updateMatch, deleteMatch } from '../controllers/match.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true }); // Para pegar o eventId do router pai, se houver

router.use(requireAuth);
router.use(requireRole(['ORGANIZER']));

// Estas rotas serão mapeadas sob /api/events/:eventId/matches ou /api/matches
router.post('/', createMatch); // Espera que seja montado em /api/events/:eventId/matches
router.put('/:id', updateMatch); // Espera que seja montado em /api/matches
router.delete('/:id', deleteMatch); // Espera que seja montado em /api/matches

export default router;
