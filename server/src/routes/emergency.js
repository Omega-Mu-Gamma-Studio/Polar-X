const express = require('express');
const { body, param } = require('express-validator');
const emergencyController = require('../controllers/emergencyController');
const { handleValidation } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const ALERT_TYPES = ['Medical', 'Fire', 'Weather', 'Equipment Failure', 'Other'];
const SEVERITIES = ['critical', 'warning', 'info'];

router.get('/alerts', emergencyController.index);
router.get('/alerts/:id', emergencyController.show);

router.post(
  '/trigger',
  [
    authenticate,
    body('alert_type').isIn(ALERT_TYPES).withMessage('alert_type must be Medical, Fire, Weather, Equipment Failure or Other'),
    body('station_id').isUUID(4).withMessage('station_id must be a valid uuid'),
    body('triggered_by').optional({ values: 'falsy' }).isUUID(4).withMessage('triggered_by must be a valid uuid'),
    body('description').optional().isLength({ max: 2000 }).withMessage('description is too long'),
    body('severity').optional().isIn(SEVERITIES).withMessage('severity must be critical, warning or info'),
    handleValidation,
  ],
  emergencyController.trigger
);

router.patch(
  '/alerts/:id/checklist',
  [
    authenticate,
    param('id').isUUID(4).withMessage('Invalid alert id'),
    body('item_id').trim().notEmpty().withMessage('item_id is required'),
    body('completed').isBoolean().withMessage('completed must be a boolean'),
    handleValidation,
  ],
  emergencyController.updateChecklist
);

router.patch(
  '/alerts/:id/resolve',
  [authenticate, param('id').isUUID(4).withMessage('Invalid alert id'), handleValidation],
  emergencyController.resolve
);

module.exports = router;