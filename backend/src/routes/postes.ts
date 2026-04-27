import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

const router = Router();

// GET /api/postes?search=&page=1&limit=20
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { title: { contains: search as string, mode: 'insensitive' as const } },
            { description: { contains: search as string, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [postes, total] = await Promise.all([
      prisma.poste.findMany({ where, orderBy: { title: 'asc' }, skip, take: limit }),
      prisma.poste.count({ where }),
    ]);

    res.json({ data: postes, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get postes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/postes/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const poste = await prisma.poste.findUnique({ where: { id: req.params.id } });

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
