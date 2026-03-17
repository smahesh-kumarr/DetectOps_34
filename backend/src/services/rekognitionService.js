const AWS = require('aws-sdk');

const rekognition = new AWS.Rekognition({
  accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region:          process.env.AWS_REGION,
});

// Keywords that indicate a cleanliness violation
// Any Rekognition label matching these (confidence >= 70%) triggers "violation"
const VIOLATION_KEYWORDS = [
  'Trash', 'Garbage', 'Waste', 'Litter', 'Pollution',
  'Rubbish', 'Filth', 'Dirty', 'Mess', 'Dump', 'Sewage', 'Stain',
];

/**
 * Analyze an S3 image using AWS Rekognition DetectLabels
 * @param {string} s3Key  - S3 object key (e.g. "cleanliness-images/userId/timestamp.jpg")
 * @returns {Promise<{ labels: Array, status: 'clean'|'violation', violationLabels: Array }>}
 */
const analyzeImage = async (s3Key) => {
  const params = {
    Image: {
      S3Object: {
        Bucket: process.env.S3_BUCKET,
        Name:   s3Key,
      },
    },
    MaxLabels:     20,  // max labels Rekognition returns
    MinConfidence: 70,  // only labels above 70% confidence
  };

  console.log(`🔍 Rekognition: analyzing s3://${process.env.S3_BUCKET}/${s3Key}`);
  const result = await rekognition.detectLabels(params).promise();

  // Normalize labels into our format
  const labels = result.Labels.map((l) => ({
    name:       l.Name,
    confidence: parseFloat(l.Confidence.toFixed(2)),
  }));

  // Check if any returned label matches violation keywords
  const violationLabels = labels.filter((l) =>
    VIOLATION_KEYWORDS.some((kw) =>
      l.name.toLowerCase().includes(kw.toLowerCase())
    )
  );

  const status = violationLabels.length > 0 ? 'violation' : 'clean';

  console.log(`🏷️  Labels detected (${labels.length}): ${labels.map((l) => l.name).join(', ')}`);
  console.log(`📊 Status: ${status.toUpperCase()}${status === 'violation' ? ` — triggered by: ${violationLabels.map((l) => l.name).join(', ')}` : ''}`);

  return { labels, status, violationLabels };
};

module.exports = { analyzeImage, VIOLATION_KEYWORDS };
