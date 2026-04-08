import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import prisma from '../prismaClient';

const router = Router();

// GET /api/users/me
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { profile: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profile: user.profile,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, currentJob, currentSalary, yearsExperience, sector, formations } = req.body;

    // Update user basic info
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      },
    });

    // Upsert profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: req.userId! },
      update: {
        currentJob: currentJob || null,
        currentSalary: currentSalary ? parseInt(currentSalary) : null,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
        sector: sector || null,
        formations: formations || null,
      },
      create: {
        userId: req.userId!,
        currentJob: currentJob || null,
        currentSalary: currentSalary ? parseInt(currentSalary) : null,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
        sector: sector || null,
        formations: formations || null,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { profile: true },
    });

    res.json({
      id: user!.id,
      email: user!.email,
      firstName: user!.firstName,
      lastName: user!.lastName,
      profile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
