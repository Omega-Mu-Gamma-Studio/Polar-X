const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 120 }),
    body('email').trim().isEmail().withMessage('email must be a valid email address').isLength({ max: 160 }),
    body('password').isLength({ min: 8 }).withMessage('password must be at least 8 characters'),
    body('role').optional().isIn(['viewer', 'commander', 'admin']).withMessage('role must be viewer, commander or admin'),
    body('station_id').optional({ values: 'falsy' }).isUUID(4).withMessage('station_id must be a valid uuid'),
    handleValidation,
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('email must be a valid email address'),
    body('password').notEmpty().withMessage('password is required'),
    handleValidation,
  ],
  authController.login
);

router.get('/me', authenticate, authController.me);

module.exports = router;