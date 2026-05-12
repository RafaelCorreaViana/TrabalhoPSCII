import { Router } from 'express';
import {
  getPublicEvents,
  getPublicEventById,
  registerForEvent,
  cancelRegistration,
  getPlayerDashboard,
  getPlayerTeams,
  getPlayerMatches,
} from '../controllers/player.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Rotas públicas (não precisam de auth, mas aproveitam a sessão se existir)
router.get('/events', getPublicEvents);
router.get('/events/:id', getPublicEventById);

// Rotas protegidas (qualquer usuário logado)
router.get('/dashboard', requireAuth, getPlayerDashboard);
router.get('/teams', requireAuth, getPlayerTeams);
router.get('/matches', requireAuth, getPlayerMatches);
router.post('/events/:id/register', requireAuth, registerForEvent);
router.delete('/events/:id/register', requireAuth, cancelRegistration);

export default router;
