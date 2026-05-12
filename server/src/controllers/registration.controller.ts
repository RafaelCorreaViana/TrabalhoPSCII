import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { io } from '../app';

const updateStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'REJECTED', 'PENDING']),
});

export const getEventRegistrations = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId as string;

    // Verifica se o evento pertence ao organizador
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    if (event.organizerId !== req.session.userId) {
      return res.status(403).json({ error: 'Sem permissão para ver inscrições deste evento' });
    }

    const registrations = await prisma.registration.findMany({
      where: { eventId },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        team: true,
      },
      orderBy: { registeredAt: 'desc' },
    });

    res.status(200).json({ registrations });
  } catch (error) {
    console.error('Get Registrations error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const updateRegistrationStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = updateStatusSchema.parse(req.body);

    const registration = await prisma.registration.findUnique({
      where: { id },
      include: { event: true }
    });

    if (!registration) {
      return res.status(404).json({ error: 'Inscrição não encontrada' });
    }

    if ((registration as any).event.organizerId !== req.session.userId) {
      return res.status(403).json({ error: 'Sem permissão para alterar inscrições deste evento' });
    }

    const updatedRegistration = await prisma.registration.update({
      where: { id },
      data: { status },
      include: {
        event: { select: { name: true } }
      }
    });

    // Enviar notificação Socket.io para o jogador avisando do novo status
    io.to(`user:${registration.playerId}`).emit('notification:new', {
      title: 'Status da Inscrição Atualizado',
      message: `Sua inscrição para o evento ${(updatedRegistration as any).event.name} foi ${status === 'CONFIRMED' ? 'Aprovada' : status === 'REJECTED' ? 'Rejeitada' : 'alterada'}.`,
      type: 'REGISTRATION',
    });

    res.status(200).json({ message: 'Status atualizado com sucesso', registration: updatedRegistration });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('Update Registration error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
