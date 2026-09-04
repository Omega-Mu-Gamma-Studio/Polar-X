const express = require('express');
const { body, param } = require('express-validator');
const cargoController = require('../controllers/cargoController');
const { handleValidation } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const SHIPMENT_STATUSES = ['in-transit', 'delivered', 'delayed'];
const latLngShape = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === 'object' && typeof value.lat === 'number' && typeof value.lng === 'number');

router.get('/', cargoController.index);

router.get('/:id/track', cargoController.track);
router.get('/:id', cargoController.show);

router.post(
  '/',
  [
    authenticate,
    body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 150 }),
    body('origin').trim().notEmpty().withMessage('origin is required').isLength({ max: 255 }),
    body('destination').trim().notEmpty().withMessage('destination is required').isLength({ max: 255 }),
    body('mission_id').optional({ values: 'falsy' }).isUUID(4).withMessage('mission_id must be a valid uuid'),
    body('status').optional().isIn(SHIPMENT_STATUSES).withMessage('status must be in-transit, delivered or delayed'),
    body('eta').optional({ values: 'falsy' }).isISO8601().withMessage('eta must be a valid date'),
    body('items').optional().isArray().withMessage('items must be an array'),
    body('current_location').optional().custom(latLngShape).withMessage('current_location must be { lat, lng }'),
    handleValidation,
  ],
  cargoController.create
);

router.patch(
  '/:id/status',
  [
    authenticate,
    param('id').isUUID(4).withMessage('Invalid shipment id'),
    body('status').isIn(SHIPMENT_STATUSES).withMessage('status must be in-transit, delivered or delayed'),
    body('current_location').optional().custom(latLngShape).withMessage('current_location must be { lat, lng }'),
    handleValidation,
  ],
  cargoController.updateStatus
);

module.exports = router;
