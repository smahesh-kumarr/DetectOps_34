const { getAllReports, getReportsByUser, updateReportStatus, deleteReport } = require('../services/dynamoService');

// @route   GET /api/reports
// @access  Protected (Admin gets all, Inspector gets their own)
const getReports = async (req, res) => {
  try {
    let reports;
    // All roles see all reports on their dashboard
    reports = await getAllReports();

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports from DynamoDB' });
  }
};

// @route   GET /api/reports/violations
// @access  Protected (Admin/Officer only)
const getViolations = async (req, res) => {
  try {
    const reports = await getAllReports();
    const violations = reports.filter((r) => r.status === 'violation');

    res.json({
      success: true,
      count: violations.length,
      data: violations,
    });
  } catch (error) {
    console.error('Fetch violations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch violations' });
  }
};

// @route   PATCH /api/reports/:id/status
// @access  Protected (Admin/Officer only)
const resolveViolation = async (req, res) => {
  try {
    const { id } = req.params;
    const { violationStatus } = req.body; // e.g., 'resolved', 'in-progress'

    if (!violationStatus) {
      return res.status(400).json({ success: false, message: 'violationStatus is required' });
    }

    const updated = await updateReportStatus(id, violationStatus, req.user.name);

    res.json({
      success: true,
      message: `Report marked as ${violationStatus}`,
      data: updated,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update report status' });
  }
};

// @route   DELETE /api/reports/:id
// @access  Protected (Officer only)
const deleteViolation = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteReport(id);

    res.json({
      success: true,
      message: 'Violation resolved and permanently removed from the database.',
    });
  } catch (error) {
    console.error('Delete violation error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete violation from DynamoDB' });
  }
};

module.exports = {
  getReports,
  getViolations,
  resolveViolation,
  deleteViolation,
};
