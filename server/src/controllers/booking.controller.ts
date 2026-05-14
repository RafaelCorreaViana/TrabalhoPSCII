import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { io } from '../app';

const bookingSchema = z.object({
  startTime: z.string().datetime({ message: 'Data/hora de início inválida.' }),
  endTime:   z.string().datetime({ message: 'Data/hora de término inválida.' }),
  matchId:   z.string().uuid().optional(),
});

const statusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'REJECTED']),
});

// GET /api/venues/:id/bookings — agenda de reservas de um local
export const getVenueBookings = async (req: Request, res: Response) => {
  try {
    const venueId = req.params.id as string;

    const bookings = await prisma.venueBooking.findMany({
      where: { venueId },
      include: {
        bookedBy: { select: { id: true, name: true, email: true } },
        match: {
          include: { event: { select: { name: true } } },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    res.json({ bookings });
  } catch (error) {
    console.error('getVenueBookings error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// POST /api/venues/:id/bookings — solicitar reserva
export const createBooking = async (req: Request, res: Response) => {
  try {
    const venueId  = req.params.id as string;
    const userId   = req.session.userId!;
    const { startTime, endTime, matchId } = bookingSchema.parse(req.body);

    const start = new Date(startTime);
    const end   = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({ error: 'O horário de término deve ser após o de início.' });
    }

    // Detecção de conflitos: verifica sobreposição com reservas PENDING ou CONFIRMED
    const conflict = await prisma.venueBooking.findFirst({
      where: {
        venueId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        AND: [
          { startTime: { lt: end } },
          { endTime:   { gt: start } },
        ],
      },
    });

    if (conflict) {
      return res.status(409).json({
        error: 'Conflito de horário: já existe uma reserva nesse período.',
      });
    }

    const booking = await prisma.venueBooking.create({
      data: {
        venueId,
        bookedById: userId,
        startTime: start,
        endTime:   end,
        matchId:   matchId || null,
        status:    'PENDING',
      },
    });

    // Notificar o admin do local via Socket.IO + banco
    const venue     = await prisma.venue.findUnique({ where: { id: venueId } });
    const requester = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

    if (venue) {
      const msg = `${requester?.name} solicitou reserva em "${venue.name}" para ${start.toLocaleDateString('pt-BR')} das ${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às ${end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`;

      io.to(`user:${venue.adminId}`).emit('notification:new', {
        title: 'Nova Solicitação de Reserva',
        message: msg,
        type: 'BOOKING',
      });

      await prisma.notification.create({
        data: {
          userId:  venue.adminId,
          title:   'Nova Solicitação de Reserva',
          message: msg,
          type:    'BOOKING',
        },
      });
    }

    res.status(201).json({ message: 'Reserva solicitada! Aguardando aprovação.', booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('createBooking error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// PATCH /api/bookings/:id/status — aprovar / rejeitar reserva (venue admin)
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const id     = req.params.id as string;
    const userId = req.session.userId!;
    const { status } = statusSchema.parse(req.body);

    const booking = await prisma.venueBooking.findUnique({
      where: { id },
      include: { venue: true },
    });

    if (!booking) return res.status(404).json({ error: 'Reserva não encontrada.' });
    if (booking.venue.adminId !== userId) return res.status(403).json({ error: 'Sem permissão.' });

    // Se confirmando, verificar conflitos novamente com outras reservas já CONFIRMED
    if (status === 'CONFIRMED') {
      const conflict = await prisma.venueBooking.findFirst({
        where: {
          venueId: booking.venueId,
          id:      { not: id },
          status:  'CONFIRMED',
          AND: [
            { startTime: { lt: booking.endTime } },
            { endTime:   { gt: booking.startTime } },
          ],
        },
      });
      if (conflict) {
        return res.status(409).json({
          error: 'Conflito de horário: já existe outra reserva confirmada nesse período.',
        });
      }
    }

    const updated = await prisma.venueBooking.update({
      where: { id },
      data:  { status },
    });

    // Notificar quem solicitou a reserva
    const statusLabel = status === 'CONFIRMED' ? 'aprovada ✅' : 'rejeitada ❌';
    const msg = `Sua reserva em "${booking.venue.name}" (${booking.startTime.toLocaleDateString('pt-BR')}) foi ${statusLabel}.`;

    io.to(`user:${booking.bookedById}`).emit('notification:new', {
      title:   status === 'CONFIRMED' ? 'Reserva Aprovada' : 'Reserva Rejeitada',
      message: msg,
      type:    'BOOKING',
    });

    await prisma.notification.create({
      data: {
        userId:  booking.bookedById,
        title:   status === 'CONFIRMED' ? 'Reserva Aprovada' : 'Reserva Rejeitada',
        message: msg,
        type:    'BOOKING',
      },
    });

    res.json({ message: 'Status da reserva atualizado.', booking: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('updateBookingStatus error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
