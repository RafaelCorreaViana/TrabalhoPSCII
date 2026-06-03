import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const venueSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  address: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  sportType: z.string().default('futsal'),
  capacity: z.number().int().positive().optional(),
  description: z.string().optional(),
});

// Strip fields not yet in DB schema
const toVenueData = (parsed: any) => {
  const { description, ...rest } = parsed;
  return rest;
};

// POST /api/venues
export const createVenue = async (req: Request, res: Response) => {
  try {
    const adminId = req.session.userId!;
    const parsedData = venueSchema.parse(req.body);

    const venue = await prisma.venue.create({
      data: { ...toVenueData(parsedData), adminId },
    });

    res.status(201).json({ message: 'Local criado com sucesso.', venue });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('createVenue error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// GET /api/venues
export const getVenues = async (req: Request, res: Response) => {
  try {
    const { sport, search } = req.query;

    const venues = await prisma.venue.findMany({
      where: {
        ...(sport && { sportType: sport as string }),
        ...(search && {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { address: { contains: search as string, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        admin: { select: { name: true, email: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ venues });
  } catch (error) {
    console.error('getVenues error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// GET /api/venues/:id
export const getVenueById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        admin: { select: { name: true, email: true } },
      },
    });

    if (!venue) {
      return res.status(404).json({ error: 'Local não encontrado.' });
    }

    res.json({ venue });
  } catch (error) {
    console.error('getVenueById error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// PUT /api/venues/:id
export const updateVenue = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const adminId = req.session.userId!;
    const parsedData = venueSchema.partial().parse(req.body);

    const venue = await prisma.venue.findUnique({ where: { id } });
    if (!venue) return res.status(404).json({ error: 'Local não encontrado.' });
    if (venue.adminId !== adminId) return res.status(403).json({ error: 'Sem permissão.' });

    const updated = await prisma.venue.update({ where: { id }, data: toVenueData(parsedData) });
    res.json({ message: 'Local atualizado.', venue: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    console.error('updateVenue error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// DELETE /api/venues/:id
export const deleteVenue = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const adminId = req.session.userId!;

    const venue = await prisma.venue.findUnique({ where: { id } });
    if (!venue) return res.status(404).json({ error: 'Local não encontrado.' });
    if (venue.adminId !== adminId) return res.status(403).json({ error: 'Sem permissão.' });

    await prisma.venue.delete({ where: { id } });
    res.json({ message: 'Local excluído com sucesso.' });
  } catch (error) {
    console.error('deleteVenue error:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};