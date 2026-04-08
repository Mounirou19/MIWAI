import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

const router = Router();

// GET /api/formations
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;

    const formations = await prisma.formation.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search as string, mode: 'insensitive' } },
              { school: { contains: search as string, mode: 'insensitive' } },
              { description: { contains: search as string, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { title: 'asc' },
    });

    res.json(formations);
  } catch (error) {
    console.error('Get formations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/formations/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const formation = await prisma.formation.findUnique({
      where: { id: req.params.id },
    });

    if (!formation) {
      res.status(404).json({ error: 'Formation not found' });
      return;
    }

    res.json(formation);
  } catch (error) {
    console.error('Get formation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
