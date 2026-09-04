const express = require('express');
const { body, param } = require('express-validator');
const inventoryController = require('../controllers/inventoryController');
const { handleValidation } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const STATUSES = ['adequate', 'low-stock', 'critical', 'out-of-stock'];

router.get('/', inventoryController.index);
router.get('/alerts', inventoryController.alerts);

router.post(
  '/',
  [
    authenticate,
    body('station_id').isUUID(4).withMessage('station_id must be a valid uuid'),
    body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 150 }),
    body('quantity').isInt({ min: 0 }).withMessage('quantity must be a non-negative integer'),
    body('threshold').isInt({ min: 0 }).withMessage('threshold must be a non-negative integer'),
    body('expiry_date')
      .optional({ values: 'falsy' })
      .isISO8601()
      .withMessage('expiry_date must be a valid date (YYYY-MM-DD)'),
    handleValidation,
  ],
  inventoryController.create
);

router.patch(
  '/:id',
  [
    authenticate,
    param('id').isUUID(4).withMessage('Invalid inventory item id'),
    body('name').optional().trim().notEmpty().withMessage('name cannot be empty').isLength({ max: 150 }),
    body('quantity').optional().isInt({ min: 0 }).withMessage('quantity must be a non-negative integer'),
    body('threshold').optional().isInt({ min: 0 }).withMessage('threshold must be a non-negative integer'),
    body('expiry_date')
      .optional({ values: 'falsy' })
      .isISO8601()
      .withMessage('expiry_date must be a valid date (YYYY-MM-DD)'),
    handleValidation,
  ],
  inventoryController.update
);

router.delete(
  '/:id',
  [authenticate, param('id').isUUID(4).withMessage('Invalid inventory item id'), handleValidation],
  inventoryController.remove
);

module.exports = router;
