const express = require('express');
const stationController = require('../controllers/stationController');

const router = express.Router();

router.get('/', stationController.index);
router.get('/:id', stationController.show);

module.exports = router;
