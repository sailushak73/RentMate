const express = require('express');
const router = express.Router();
const { scheduleVisit, getVisits, updateVisitStatus } = require('../controllers/visitController');
const { auth, restrictTo } = require('../middleware/auth');

router.post('/', auth, restrictTo('tenant'), scheduleVisit);
router.get('/', auth, getVisits);
router.put('/:id/status', auth, restrictTo('owner'), updateVisitStatus);

module.exports = router;
