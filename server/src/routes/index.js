const express = require('express');
const { getHealth } = require('../controllers/healthController');
const stationRoutes = require('./stations');
const missionRoutes = require('./missions');
const cargoRoutes = require('./cargo');
const inventoryRoutes = require('./inventory');
const personnelRoutes = require('./personnel');
const emergencyRoutes = require('./emergency');
const authRoutes = require('./auth');

const router = express.Router();

// Phase 0 — liveness
router.get('/health', getHealth);

// Phase 1 — stations & missions
router.use('/stations', stationRoutes);
router.use('/missions', missionRoutes);

// Phase 2 — cargo / shipments
router.use('/cargo/shipments', cargoRoutes);

// Phase 3 — inventory
router.use('/inventory', inventoryRoutes);

// Phase 4 — personnel
router.use('/personnel', personnelRoutes);

// Phase 5 — emergency response
router.use('/emergency', emergencyRoutes);

// Phase 7 — auth
router.use('/auth', authRoutes);

module.exports = router;
