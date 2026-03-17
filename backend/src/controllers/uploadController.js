const multer  = require('multer');
const { uploadToS3 }   = require('../services/s3Service');
const { analyzeImage } = require('../services/rekognitionService');
const { saveReport }   = require('../services/dynamoService');

// ── Multer config: store file in memory (not disk) ───────────────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG and PNG images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

// ── Upload middleware (export so route can use it) ────────────────────────
const uploadMiddleware = upload.single('image');

// @route   POST /api/upload
// @access  Inspector only
const uploadImage = async (req, res) => {
  try {
    // 1. Validate file presence
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    // 2. Validate body fields
    const { locationName, description, lat, lng } = req.body;
    if (!locationName) {
      return res.status(400).json({ success: false, message: 'locationName is required' });
    }

    // 3. Upload image to AWS S3
    console.log(`📤 Uploading image to S3 for user ${req.user._id}...`);
    const { url: imageUrl, key: s3Key } = await uploadToS3(
      req.file.buffer,
      req.user._id.toString(),
      req.file.mimetype
    );
    console.log(`✅ S3 upload success: ${imageUrl}`);

    // 4. Run AWS Rekognition analysis on the uploaded S3 image
    console.log(`🔍 Running Rekognition analysis...`);
    const { labels, status, violationLabels } = await analyzeImage(s3Key);
    console.log(`✅ Rekognition complete → status: ${status.toUpperCase()}`);

    // 5. Save full report to AWS DynamoDB
    const reportData = {
      imageUrl,
      s3Key,
      labels,
      status,
      location: {
        name: locationName,
        lat:  lat ? parseFloat(lat) : null,
        lng:  lng ? parseFloat(lng) : null,
      },
      description:   description || '',
      userId:        req.user._id.toString(), // DynamoDB needs strings, Mongoose Objects won't work easily
      inspectorName: req.user.name,
    };
    
    const report = await saveReport(reportData);
    console.log(`✅ Report saved to DynamoDB: ${report.reportId}`);

    // 6. If it's a violation, send an SES Email Alert to Officers
    if (status === 'violation') {
      const User = require('../models/User'); // Import dynamically to avoid circular deps if any
      const { sendViolationAlert } = require('../services/sesService');

      // Find all officers in MongoDB
      const officers = await User.find({ role: 'officer' }).select('email');
      const officerEmails = officers.map((off) => off.email);

      // Async send (don't block the API response waiting for SES)
      sendViolationAlert(report, officerEmails).catch((err) => {
        console.error('SES Alert failed to send safely in background:', err.message);
      });
    }

    // 7. Return result
    res.status(201).json({
      success: true,
      message: `Image uploaded — status: ${status.toUpperCase()}`,
      report: {
        id:              report.reportId,
        imageUrl:        report.imageUrl,
        status:          report.status,
        location:        report.location,
        labels:          labels.slice(0, 5),
        violationLabels: violationLabels.map((l) => l.name),
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
};

module.exports = { uploadMiddleware, uploadImage };
