import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// GET /api/notifications - listar notificações do usuário logado
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// PATCH /api/notifications/read-all - marcar todas como lidas
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId!;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'Notificações marcadas como lidas.' });
  } catch (error) {
    console.error('markAllAsRead error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// PATCH /api/notifications/:id/read - marcar uma como lida
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.session.userId!;

    await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    res.json({ message: 'Notificação marcada como lida.' });
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
