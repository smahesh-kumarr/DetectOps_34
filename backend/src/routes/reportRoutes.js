const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getReports, getViolations, resolveViolation, deleteViolation } = require('../controllers/reportController');

// @route   GET /api/reports
// @access  Inspector/Admin
router.get('/', protect, authorize('inspector', 'admin', 'officer'), getReports);

// @route   GET /api/reports/violations
// @access  Admin/Officer
router.get('/violations', protect, authorize('admin', 'officer'), getViolations);

// @route   PATCH /api/reports/:id/status
// @access  Admin/Officer
router.patch('/:id/status', protect, authorize('admin', 'officer'), resolveViolation);

// @route   DELETE /api/reports/:id
// @access  Officer only — permanently deletes a resolved violation
router.delete('/:id', protect, authorize('officer'), deleteViolation);

module.exports = router;
