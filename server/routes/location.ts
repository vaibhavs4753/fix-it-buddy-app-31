import { Router } from 'express';
import { db } from '../db';
import { technicianProfiles, technicianLocationRealTime, locationHistory } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Update technician location
router.post('/update', authenticate, async (req: AuthRequest, res) => {
  try {
    const { lat, lng, accuracy, heading, speed, serviceSessionId } = req.body;

    // Update technician profile location
    await db.update(technicianProfiles)
      .set({
        currentLocationLat: lat.toString(),
        currentLocationLng: lng.toString(),
      })
      .where(eq(technicianProfiles.userId, req.userId!));

    // Update real-time location
    const [existing] = await db.select()
      .from(technicianLocationRealTime)
      .where(eq(technicianLocationRealTime.technicianId, req.userId!))
      .limit(1);

    if (existing) {
      await db.update(technicianLocationRealTime)
        .set({
          lat: lat.toString(),
          lng: lng.toString(),
          accuracy,
          heading: heading?.toString(),
          speed: speed?.toString(),
          updatedAt: new Date(),
        })
        .where(eq(technicianLocationRealTime.technicianId, req.userId!));
    } else {
      await db.insert(technicianLocationRealTime)
        .values({
          technicianId: req.userId!,
          lat: lat.toString(),
          lng: lng.toString(),
          accuracy,
          heading: heading?.toString(),
          speed: speed?.toString(),
          status: 'active',
        });
    }

    // Store location history if service session exists
    if (serviceSessionId) {
      await db.insert(locationHistory)
        .values({
          serviceSessionId,
          technicianId: req.userId!,
          lat: lat.toString(),
          lng: lng.toString(),
          accuracy: accuracy?.toString(),
        });
    }

    res.json({ success: true, message: 'Location updated successfully' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Get technician location
router.get('/technician/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const [location] = await db.select()
      .from(technicianLocationRealTime)
      .where(eq(technicianLocationRealTime.technicianId, req.params.id))
      .limit(1);

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ error: 'Failed to get location' });
  }
});

export default router;
