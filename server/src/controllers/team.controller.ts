import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const createTeamSchema = z.object({
  name: z.string().min(3, 'Nome do time deve ter pelo menos 3 caracteres'),
});

const addMemberSchema = z.object({
  playerId: z.string().uuid(),
});

export const createTeam = async (req: Request, res: Response) => {
  try {
    const data = createTeamSchema.parse(req.body);

    const team = await prisma.team.create({
      data: {
        name: data.name,
      },
    });

    res.status(201).json({ message: 'Equipe criada com sucesso', team });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('Create Team error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const addTeamMember = async (req: Request, res: Response) => {
  try {
    const teamId = req.params.id as string;
    const { playerId } = addMemberSchema.parse(req.body);

    // Na fase 3, o organizador é quem gerencia os times para o evento
    // Aqui assumimos que ele já validou que o jogador está aprovado no evento.
    // Futuramente podemos adicionar uma validação forte aqui (checar Registration).
    
    // Verificar se o jogador já está no time
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_playerId: {
          teamId,
          playerId,
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Jogador já faz parte desta equipe' });
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId,
        playerId,
      },
    });

    // TODO: Disparar notificação Socket.io para o jogador

    res.status(201).json({ message: 'Jogador adicionado à equipe', member });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('Add Team Member error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};
