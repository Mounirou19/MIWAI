import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

const router = Router();

// GET /api/formations?search=&page=1&limit=20
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
            { school: { contains: search as string, mode: 'insensitive' as const } },
            { description: { contains: search as string, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [formations, total] = await Promise.all([
      prisma.formation.findMany({ where, orderBy: { title: 'asc' }, skip, take: limit }),
      prisma.formation.count({ where }),
    ]);

    res.json({ data: formations, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get formations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/formations/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const formation = await prisma.formation.findUnique({ where: { id: req.params.id } });

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
