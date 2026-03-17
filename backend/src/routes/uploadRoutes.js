const express  = require('express');
const router   = express.Router();
const { protect }         = require('../middleware/authMiddleware');
const { authorize }       = require('../middleware/roleMiddleware');
const { uploadMiddleware, uploadImage } = require('../controllers/uploadController');

// @route   POST /api/upload
// @access  Inspector only
// multer middleware runs first (parses multipart/form-data), then uploadImage
router.post('/', protect, authorize('inspector'), uploadMiddleware, uploadImage);

module.exports = router;
