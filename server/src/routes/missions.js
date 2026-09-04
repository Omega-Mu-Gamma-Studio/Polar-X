const express = require('express');
const { body } = require('express-validator');
const missionController = require('../controllers/missionController');
const { handleValidation } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', missionController.index);

router.post(
  '/',
  [
    authenticate,
    body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 150 }),
    body('station_id').isUUID(4).withMessage('station_id must be a valid uuid'),
    body('start_date').notEmpty().withMessage('start_date is required').isISO8601().withMessage('start_date must be a valid date'),
    body('end_date').optional({ values: 'falsy' }).isISO8601().withMessage('end_date must be a valid date'),
    body('status').optional().isIn(['planned', 'active', 'completed']).withMessage('status must be planned, active or completed'),
    body('personnel_count').optional().isInt({ min: 0 }).withMessage('personnel_count must be a non-negative integer'),
    body('cargo_count').optional().isInt({ min: 0 }).withMessage('cargo_count must be a non-negative integer'),
    handleValidation,
  ],
  missionController.create
);

module.exports = router;
