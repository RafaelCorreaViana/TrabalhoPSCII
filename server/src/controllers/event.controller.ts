import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const eventSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  sportType: z.string().default('futsal'),
  description: z.string().optional(),
  rules: z.string().optional(),
  maxParticipants: z.number().int().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const createEvent = async (req: Request, res: Response) => {
  try {
    const data = eventSchema.parse(req.body);

    if (!req.session.userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const event = await prisma.event.create({
      data: {
        ...data,
        organizerId: req.session.userId,
      },
    });

    res.status(201).json({ message: 'Evento criado com sucesso', event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('Create Event error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Se for organizador, listar os eventos que ele criou. Se for jogador, listar eventos ativos?
    // Na fase 3, o foco é o organizador.
    const events = await prisma.event.findMany({
      where: {
        organizerId: req.session.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({ events });
  } catch (error) {
    console.error('Get Events error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { name: true, email: true },
        },
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true,
            venue: true,
          }
        },
        registrations: {
          include: {
            player: { select: { name: true, email: true } },
            team: true,
          }
        }
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.status(200).json({ event });
  } catch (error) {
    console.error('Get Event By Id error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    // Verifica se o evento existe e pertence ao organizador
    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    if (existingEvent.organizerId !== req.session.userId) {
      return res.status(403).json({ error: 'Sem permissão para editar este evento' });
    }

    // Usa partial para permitir atualizações parciais ou o mesmo schema de criação + status
    const updateSchema = eventSchema.extend({
      status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'FINISHED']).optional()
    }).partial();

    const data = updateSchema.parse(req.body);

    const event = await prisma.event.update({
      where: { id },
      data,
    });

    res.status(200).json({ message: 'Evento atualizado com sucesso', event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('Update Event error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const existingEvent = await prisma.event.findUnique({ where: { id } });
    if (!existingEvent) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    if (existingEvent.organizerId !== req.session.userId) {
      return res.status(403).json({ error: 'Sem permissão para deletar este evento' });
    }

    await prisma.event.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Evento excluído com sucesso' });
  } catch (error) {
    console.error('Delete Event error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
