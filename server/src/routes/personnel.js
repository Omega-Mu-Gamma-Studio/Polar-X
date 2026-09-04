const express = require('express');
const { body, param } = require('express-validator');
const personnelController = require('../controllers/personnelController');
const { handleValidation } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const STATUSES = ['on-duty', 'in-field', 'at-base', 'on-leave'];
const latLngShape = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === 'object' && typeof value.lat === 'number' && typeof value.lng === 'number');

router.get('/', personnelController.index);
router.get('/:id', personnelController.show);

router.post(
  '/',
  [
    authenticate,
    body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 120 }),
    body('role').trim().notEmpty().withMessage('role is required').isLength({ max: 120 }),
    body('station_id').isUUID(4).withMessage('station_id must be a valid uuid'),
    body('rotation_start')
      .notEmpty()
      .withMessage('rotation_start is required')
      .isISO8601()
      .withMessage('rotation_start must be a valid date'),
    body('rotation_end')
      .optional({ values: 'falsy' })
      .isISO8601()
      .withMessage('rotation_end must be a valid date'),
    body('status').optional().isIn(STATUSES).withMessage('status must be on-duty, in-field, at-base or on-leave'),
    body('qualifications').optional().isArray().withMessage('qualifications must be an array of strings'),
    body('current_location').optional().custom(latLngShape).withMessage('current_location must be { lat, lng }'),
    handleValidation,
  ],
  personnelController.create
);

router.patch(
  '/:id/status',
  [
    authenticate,
    param('id').isUUID(4).withMessage('Invalid personnel id'),
    body('status').isIn(STATUSES).withMessage('status must be on-duty, in-field, at-base or on-leave'),
    handleValidation,
  ],
  personnelController.updateStatus
);

router.patch(
  '/:id/location',
  [
    authenticate,
    param('id').isUUID(4).withMessage('Invalid personnel id'),
    body('current_location')
      .custom(latLngShape)
      .withMessage('current_location must be { lat, lng }'),
    handleValidation,
  ],
  personnelController.updateLocation
);

module.exports = router;