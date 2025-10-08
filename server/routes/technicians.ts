import { Router } from 'express';
import { db } from '../db';
import { technicianProfiles, serviceRequests, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all technicians
router.get('/', async (req, res) => {
  try {
    const { serviceType } = req.query;
    
    let technicians;
    
    if (serviceType && (serviceType === 'electrician' || serviceType === 'mechanic' || serviceType === 'plumber')) {
      technicians = await db.select()
        .from(technicianProfiles)
        .where(eq(technicianProfiles.serviceType, serviceType));
    } else {
      technicians = await db.select().from(technicianProfiles);
    }
    
    res.json(technicians);
  } catch (error) {
    console.error('Get technicians error:', error);
    res.status(500).json({ error: 'Failed to get technicians' });
  }
});

// Get technician by ID
router.get('/:id', async (req, res) => {
  try {
    const [technician] = await db.select()
      .from(technicianProfiles)
      .where(eq(technicianProfiles.id, req.params.id))
      .limit(1);
    
    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    res.json(technician);
  } catch (error) {
    console.error('Get technician error:', error);
    res.status(500).json({ error: 'Failed to get technician' });
  }
});

// Create/Update technician profile
router.post('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const {
      name,
      phone,
      serviceType,
      description,
      experienceYears,
      hourlyRate,
    } = req.body;

    // Check if profile exists
    const [existing] = await db.select()
      .from(technicianProfiles)
      .where(eq(technicianProfiles.userId, req.userId!))
      .limit(1);

    if (existing) {
      // Update
      const [updated] = await db.update(technicianProfiles)
        .set({
          name,
          phone,
          serviceType,
          description,
          experienceYears,
          hourlyRate: hourlyRate?.toString(),
        })
        .where(eq(technicianProfiles.userId, req.userId!))
        .returning();
      
      return res.json(updated);
    } else {
      // Create
      const [created] = await db.insert(technicianProfiles)
        .values({
          userId: req.userId!,
          name,
          phone,
          serviceType,
          description,
          experienceYears,
          hourlyRate: hourlyRate?.toString(),
        })
        .returning();
      
      return res.json(created);
    }
  } catch (error) {
    console.error('Create/Update technician profile error:', error);
    res.status(500).json({ error: 'Failed to save technician profile' });
  }
});

// Accept service request
router.post('/accept/:requestId', authenticate, async (req: AuthRequest, res) => {
  try {
    const [request] = await db.select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, req.params.requestId))
      .limit(1);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already accepted' });
    }

    const [updated] = await db.update(serviceRequests)
      .set({
        technicianId: req.userId!,
        status: 'accepted',
      })
      .where(eq(serviceRequests.id, req.params.requestId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ error: 'Failed to accept request' });
  }
});

export default router;
