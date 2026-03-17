const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region:          process.env.AWS_REGION,
});

/**
 * Upload a file buffer to S3
 * @param {Buffer} fileBuffer   - raw file data from multer
 * @param {string} userId       - inspector's userId (used in S3 key path)
 * @param {string} mimeType     - e.g. 'image/jpeg'
 * @returns {Promise<{ url: string, key: string }>}
 */
const uploadToS3 = async (fileBuffer, userId, mimeType) => {
  const extension = mimeType === 'image/png' ? 'png' : 'jpg';
  const key       = `cleanliness-images/${userId}/${Date.now()}.${extension}`;

  const params = {
    Bucket:      process.env.S3_BUCKET,
    Key:         key,
    Body:        fileBuffer,
    ContentType: mimeType,
    // ACL removed — public access handled by bucket policy instead
    // (new S3 buckets created after Apr 2023 have ACLs disabled by default)
  };

  const result = await s3.upload(params).promise();
  return {
    url: result.Location, // public HTTPS URL
    key: result.Key,       // S3 object key (for Rekognition in Phase 4)
  };
};

/**
 * Delete an object from S3 (for cleanup if needed)
 */
const deleteFromS3 = async (key) => {
  const params = { Bucket: process.env.S3_BUCKET, Key: key };
  await s3.deleteObject(params).promise();
};

module.exports = { uploadToS3, deleteFromS3 };
