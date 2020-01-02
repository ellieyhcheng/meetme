const express = require('express');
let router = express.Router();

const controller = require('../controller/event')

router.get('/:id', controller.getEvent)

// Process login
router.post('/:id/login', controller.processLogin)

// Update availability
router.post('/:id', controller.updateAvailability)

// Create event
router.post('/', controller.createEvent)

module.exports = router;