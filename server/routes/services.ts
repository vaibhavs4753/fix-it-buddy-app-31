import { Router } from 'express';
import { db } from '../db';
import { serviceRequests, services, technicianProfiles } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const allServices = await db.select().from(services).where(eq(services.isActive, true));
    res.json(allServices);
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to get services' });
  }
});

// Create service request
router.post('/requests', authenticate, async (req: AuthRequest, res) => {
  try {
    const {
      serviceType,
      description,
      locationLat,
      locationLng,
      locationAddress,
      mediaUrls,
      paymentMethod,
      urgency,
    } = req.body;

    const [request] = await db.insert(serviceRequests).values({
      clientId: req.userId!,
      serviceType,
      description,
      locationLat: locationLat.toString(),
      locationLng: locationLng.toString(),
      locationAddress,
      mediaUrls: mediaUrls || [],
      paymentMethod,
      urgency: urgency || 'medium',
      status: 'pending',
    }).returning();

    res.json(request);
  } catch (error) {
    console.error('Create service request error:', error);
    res.status(500).json({ error: 'Failed to create service request' });
  }
});

// Get user's service requests
router.get('/requests/my', authenticate, async (req: AuthRequest, res) => {
  try {
    const requests = await db.select()
      .from(serviceRequests)
      .where(eq(serviceRequests.clientId, req.userId!));
    
    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Failed to get requests' });
  }
});

// Get service request by ID
router.get('/requests/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const [request] = await db.select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, req.params.id))
      .limit(1);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check if user has access
    if (request.clientId !== req.userId && request.technicianId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(request);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Failed to get request' });
  }
});

// Update service request status
router.patch('/requests/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status, estimatedPrice, actualPrice } = req.body;
    
    const [request] = await db.select()
      .from(serviceRequests)
      .where(eq(serviceRequests.id, req.params.id))
      .limit(1);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check permissions
    if (request.clientId !== req.userId && request.technicianId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (estimatedPrice) updates.estimatedPrice = estimatedPrice.toString();
    if (actualPrice) updates.actualPrice = actualPrice.toString();

    const [updated] = await db.update(serviceRequests)
      .set(updates)
      .where(eq(serviceRequests.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

export default router;
