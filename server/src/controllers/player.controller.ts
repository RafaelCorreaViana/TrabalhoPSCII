import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { io } from '../app';

// GET /api/player/events - listar eventos ativos disponíveis
export const getPublicEvents = async (req: Request, res: Response) => {
  try {
    const { sport, search } = req.query;

    const events = await prisma.event.findMany({
      where: {
        status: { in: ['ACTIVE'] },
        ...(sport && { sportType: sport as string }),
        ...(search && { name: { contains: search as string, mode: 'insensitive' } }),
      },
      include: {
        organizer: { select: { name: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { startDate: 'asc' },
    });

    res.json({ events });
  } catch (error) {
    console.error('getPublicEvents error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// GET /api/player/events/:id - detalhes de um evento público
export const getPublicEventById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: { select: { name: true, email: true } },
        matches: {
          include: {
            homeTeam: true,
            awayTeam: true,
            venue: true,
          },
          orderBy: { dateTime: 'asc' },
        },
        _count: { select: { registrations: true } },
      },
    });

    if (!event) return res.status(404).json({ error: 'Evento não encontrado.' });

    // Se o jogador estiver logado, verificar se está inscrito
    let myRegistration = null;
    if (req.session.userId) {
      myRegistration = await prisma.registration.findUnique({
        where: { eventId_playerId: { eventId: id, playerId: req.session.userId } },
      });
    }

    res.json({ event, myRegistration });
  } catch (error) {
    console.error('getPublicEventById error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// POST /api/player/events/:id/register - solicitar inscrição
export const registerForEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id as string;
    const playerId = req.session.userId!;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Evento não encontrado.' });
    if (event.status !== 'ACTIVE') return res.status(400).json({ error: 'Este evento não está aceitando inscrições.' });

    // Verificar limite de participantes
    if (event.maxParticipants) {
      const confirmedCount = await prisma.registration.count({
        where: { eventId, status: 'CONFIRMED' },
      });
      if (confirmedCount >= event.maxParticipants) {
        return res.status(400).json({ error: 'Evento lotado. Não há mais vagas disponíveis.' });
      }
    }

    // Verificar se já está inscrito
    const existing = await prisma.registration.findUnique({
      where: { eventId_playerId: { eventId, playerId } },
    });
    if (existing) return res.status(400).json({ error: 'Você já está inscrito neste evento.' });

    const registration = await prisma.registration.create({
      data: { eventId, playerId, status: 'PENDING' },
    });

    // Notificar o organizador via Socket.IO
    const player = await prisma.user.findUnique({ where: { id: playerId }, select: { name: true } });
    io.to(`user:${event.organizerId}`).emit('notification:new', {
      title: 'Nova Inscrição!',
      message: `${player?.name} solicitou inscrição no evento "${event.name}".`,
      type: 'REGISTRATION',
    });

    // Persistir notificação no banco para o organizador
    await prisma.notification.create({
      data: {
        userId: event.organizerId,
        title: 'Nova Inscrição!',
        message: `${player?.name} solicitou inscrição no evento "${event.name}".`,
        type: 'REGISTRATION',
      },
    });

    res.status(201).json({ message: 'Inscrição realizada com sucesso! Aguardando aprovação.', registration });
  } catch (error) {
    console.error('registerForEvent error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// DELETE /api/player/events/:id/register - cancelar inscrição
export const cancelRegistration = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id as string;
    const playerId = req.session.userId!;

    const registration = await prisma.registration.findUnique({
      where: { eventId_playerId: { eventId, playerId } },
    });
    if (!registration) return res.status(404).json({ error: 'Inscrição não encontrada.' });
    if (registration.status === 'CONFIRMED') {
      return res.status(400).json({ error: 'Não é possível cancelar uma inscrição já confirmada. Contate o organizador.' });
    }

    await prisma.registration.delete({ where: { eventId_playerId: { eventId, playerId } } });

    res.json({ message: 'Inscrição cancelada com sucesso.' });
  } catch (error) {
    console.error('cancelRegistration error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// GET /api/player/dashboard - dados do dashboard do jogador
export const getPlayerDashboard = async (req: Request, res: Response) => {
  try {
    const playerId = req.session.userId!;

    const registrations = await prisma.registration.findMany({
      where: { playerId },
      include: {
        event: {
          include: {
            organizer: { select: { name: true } },
            matches: {
              where: { status: 'SCHEDULED' },
              orderBy: { dateTime: 'asc' },
              take: 1,
              include: { homeTeam: true, awayTeam: true, venue: true },
            },
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });

    const upcomingMatches = await prisma.match.findMany({
      where: {
        status: 'SCHEDULED',
        event: {
          registrations: { some: { playerId, status: 'CONFIRMED' } },
        },
        dateTime: { gte: new Date() },
      },
      include: {
        event: { select: { name: true } },
        homeTeam: true,
        awayTeam: true,
        venue: true,
      },
      orderBy: { dateTime: 'asc' },
      take: 5,
    });

    res.json({ registrations, upcomingMatches });
  } catch (error) {
    console.error('getPlayerDashboard error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// GET /api/player/teams - listar equipes que o jogador faz parte
export const getPlayerTeams = async (req: Request, res: Response) => {
  try {
    const playerId = req.session.userId!;

    const teams = await prisma.teamMember.findMany({
      where: { playerId },
      include: {
        team: {
          include: {
            _count: { select: { members: true } },
            members: {
              include: { player: { select: { name: true } } }
            }
          }
        }
      }
    });

    res.json({ teams: teams.map(t => t.team) });
  } catch (error) {
    console.error('getPlayerTeams error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// GET /api/player/matches - listar todas as partidas (passadas e futuras) do jogador
export const getPlayerMatches = async (req: Request, res: Response) => {
  try {
    const playerId = req.session.userId!;

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { homeTeam: { members: { some: { playerId } } } },
          { awayTeam: { members: { some: { playerId } } } }
        ]
      },
      include: {
        event: { select: { name: true } },
        homeTeam: true,
        awayTeam: true,
        venue: true,
      },
      orderBy: { dateTime: 'desc' }
    });

    res.json({ matches });
  } catch (error) {
    console.error('getPlayerMatches error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
