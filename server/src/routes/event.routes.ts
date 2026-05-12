import { Router } from 'express';
import { createEvent, getEvents, getEventById, updateEvent, deleteEvent } from '../controllers/event.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas de evento requerem autenticação
router.use(requireAuth);

// Rotas exclusivas para Organizadores
router.post('/', requireRole(['ORGANIZER']), createEvent);
router.put('/:id', requireRole(['ORGANIZER']), updateEvent);
router.delete('/:id', requireRole(['ORGANIZER']), deleteEvent);

// Rotas de leitura
// O getEvents pode ser usado por jogadores também se eles quiserem ver todos os eventos,
// mas para o dashboard do organizador, ele retorna os dele. Vamos ajustar depois se precisar.
router.get('/', getEvents);
router.get('/:id', getEventById);

export default router;
