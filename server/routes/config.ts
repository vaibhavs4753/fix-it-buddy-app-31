import { Router } from 'express';

const router = Router();

// Get Mapbox token
router.get('/mapbox-token', (req, res) => {
  const token = process.env.MAPBOX_PUBLIC_TOKEN;
  
  if (!token) {
    return res.status(500).json({ error: 'Mapbox token not configured' });
  }

  res.json({ token });
});

export default router;
