import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

const router = Router();

// GET /api/postes
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;

    const postes = await prisma.poste.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search as string, mode: 'insensitive' } },
              { description: { contains: search as string, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { title: 'asc' },
    });

    res.json(postes);
  } catch (error) {
    console.error('Get postes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/postes/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const poste = await prisma.poste.findUnique({
      where: { id: req.params.id },
    });

    if (!poste) {
      res.status(404).json({ error: 'Poste not found' });
      return;
    }

    res.json(poste);
  } catch (error) {
    console.error('Get poste error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
