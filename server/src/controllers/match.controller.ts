import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const createMatchSchema = z.object({
  venueId: z.string().uuid().optional().nullable(),
  homeTeamId: z.string().uuid().optional().nullable(),
  awayTeamId: z.string().uuid().optional().nullable(),
  dateTime: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const updateMatchSchema = z.object({
  venueId: z.string().uuid().optional().nullable(),
  homeTeamId: z.string().uuid().optional().nullable(),
  awayTeamId: z.string().uuid().optional().nullable(),
  dateTime: z.string().datetime().optional().nullable(),
  homeScore: z.number().int().min(0).optional().nullable(),
  awayScore: z.number().int().min(0).optional().nullable(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'FINISHED', 'CANCELLED']).optional(),
  notes: z.string().optional().nullable(),
});

export const createMatch = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId as string;
    const data = createMatchSchema.parse(req.body);

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    if (event.organizerId !== req.session.userId) {
      return res.status(403).json({ error: 'Sem permissão para adicionar partidas a este evento' });
    }

    // Validação básica de conflito de horário (se tiver venueId e dateTime)
    if (data.venueId && data.dateTime) {
      const dateObj = new Date(data.dateTime);
      const startTime = new Date(dateObj.getTime() - 60 * 60 * 1000); // 1h antes
      const endTime = new Date(dateObj.getTime() + 60 * 60 * 1000); // 1h depois

      const conflictingMatch = await prisma.match.findFirst({
        where: {
          venueId: data.venueId,
          dateTime: {
            gte: startTime,
            lte: endTime,
          },
          status: {
            notIn: ['CANCELLED', 'FINISHED']
          }
        }
      });

      if (conflictingMatch) {
        return res.status(400).json({ error: 'Conflito de horário: já existe uma partida marcada neste local neste horário.' });
      }
    }

    const match = await prisma.match.create({
      data: {
        ...data,
        eventId: eventId as string,
      },
    });

    res.status(201).json({ message: 'Partida criada com sucesso', match });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('Create Match error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const updateMatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const data = updateMatchSchema.parse(req.body);

    const matchToUpdate = await prisma.match.findUnique({ 
      where: { id },
      include: { event: true }
    });

    if (!matchToUpdate) {
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    if ((matchToUpdate as any).event.organizerId !== req.session.userId) {
      return res.status(403).json({ error: 'Sem permissão para editar esta partida' });
    }

    const match = await prisma.match.update({
      where: { id },
      data,
    });

    res.status(200).json({ message: 'Partida atualizada com sucesso', match });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('Update Match error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const deleteMatch = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const matchToDelete = await prisma.match.findUnique({ 
      where: { id },
      include: { event: true }
    });

    if (!matchToDelete) {
      return res.status(404).json({ error: 'Partida não encontrada' });
    }

    if ((matchToDelete as any).event.organizerId !== req.session.userId) {
      return res.status(403).json({ error: 'Sem permissão para deletar esta partida' });
    }

    await prisma.match.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Partida excluída com sucesso' });
  } catch (error) {
    console.error('Delete Match error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
