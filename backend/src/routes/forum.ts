import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import prisma from '../prismaClient';

const router = Router();

// GET /api/forum/topics?search=&page=1&limit=20
router.get('/topics', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { title: { contains: search as string, mode: 'insensitive' as const } },
            { body: { contains: search as string, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [topics, total] = await Promise.all([
      prisma.forumTopic.findMany({
        where,
        include: {
          author: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { replies: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.forumTopic.count({ where }),
    ]);

    res.json({ data: topics, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/forum/topics
router.post('/topics', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      res.status(400).json({ error: 'Title and body are required' });
      return;
    }

    if (title.length > 200) {
      res.status(400).json({ error: 'Title must be under 200 characters' });
      return;
    }

    if (body.length > 10000) {
      res.status(400).json({ error: 'Body must be under 10000 characters' });
      return;
    }

    const topic = await prisma.forumTopic.create({
      data: { title, body, authorId: req.userId! },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { replies: true } },
      },
    });

    res.status(201).json(topic);
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/forum/topics/:id
router.get('/topics/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    // findUnique + incrément des vues en parallèle
    const [topic] = await Promise.all([
      prisma.forumTopic.findUnique({
        where: { id: req.params.id },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, email: true } },
          replies: {
            include: {
              author: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: { select: { replies: true } },
        },
      }),
      prisma.forumTopic.updateMany({
        where: { id: req.params.id },
        data: { views: { increment: 1 } },
      }),
    ]);

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    res.json(topic);
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/forum/topics/:id/replies
router.post('/topics/:id/replies', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { body } = req.body;

    if (!body) {
      res.status(400).json({ error: 'Body is required' });
      return;
    }

    if (body.length > 5000) {
      res.status(400).json({ error: 'Reply must be under 5000 characters' });
      return;
    }

    const topic = await prisma.forumTopic.findUnique({ where: { id: req.params.id } });

    if (!topic) {
      res.status(404).json({ error: 'Topic not found' });
      return;
    }

    const reply = await prisma.forumReply.create({
      data: { topicId: req.params.id, body, authorId: req.userId! },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    res.status(201).json(reply);
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
