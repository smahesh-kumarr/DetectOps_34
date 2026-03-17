const AWS = require('aws-sdk');
const crypto = require('crypto');

const dynamoDb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const TABLE_NAME = 'CitizenCleanlinessReports';

/**
 * Save a new cleanliness report to DynamoDB
 * @param {Object} reportData - report details (imageUrl, labels, status, location, etc.)
 * @returns {Promise<Object>} The saved report with generated reportId
 */
const saveReport = async (reportData) => {
  const reportId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const item = {
    reportId,
    ...reportData,
    violationStatus: reportData.status === 'violation' ? 'pending' : null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const params = {
    TableName: TABLE_NAME,
    Item: item,
  };

  console.log(`💾 Saving report to DynamoDB [${TABLE_NAME}]...`);
  await dynamoDb.put(params).promise();

  return item;
};

/**
 * Fetch all reports from DynamoDB (for Admin dashboard)
 */
const getAllReports = async () => {
  const params = { TableName: TABLE_NAME };
  const data = await dynamoDb.scan(params).promise();
  return data.Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Fetch reports for a specific inspector (by userId)
 */
const getReportsByUser = async (userId) => {
  // Using Scan for simplicity in hackathon. For production, a GSI on userId is better.
  const params = {
    TableName: TABLE_NAME,
    FilterExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': userId },
  };
  const data = await dynamoDb.scan(params).promise();
  return data.Items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Update the violation resolution status
 */
const updateReportStatus = async (reportId, newStatus, resolvedBy) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { reportId },
    UpdateExpression: 'set violationStatus = :vs, resolvedBy = :rb, updatedAt = :ua',
    ExpressionAttributeValues: {
      ':vs': newStatus,
      ':rb': resolvedBy,
      ':ua': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  };

  const data = await dynamoDb.update(params).promise();
  return data.Attributes;
};

/**
 * Permanently delete a report from DynamoDB (used when Officer resolves a violation)
 */
const deleteReport = async (reportId) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { reportId },
  };

  console.log(`🗑️  Deleting resolved report [${reportId}] from DynamoDB...`);
  await dynamoDb.delete(params).promise();
  return { reportId, deleted: true };
};

module.exports = {
  saveReport,
  getAllReports,
  getReportsByUser,
  updateReportStatus,
  deleteReport,
};
