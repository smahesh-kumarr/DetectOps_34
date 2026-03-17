const AWS = require('aws-sdk');

const ses = new AWS.SES({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Send an email alert to officers when a new violation is reported
 * @param {Object} report - The full report object (needs id, location, labels, imageUrl)
 * @param {Array<string>} officerEmails - List of emails to receive the alert
 */
const sendViolationAlert = async (report, officerEmails) => {
  if (!officerEmails || officerEmails.length === 0) {
    console.log('⚠️ No officer emails provided for SES alert.');
    return;
  }

  const senderEmail = process.env.SES_SENDER_EMAIL;
  
  const params = {
    Source: senderEmail,
    Destination: { ToAddresses: officerEmails },
    Message: {
      Subject: {
        Data: `🚨 Cleanliness Violation Detected: ${report.location?.name || 'Unknown Location'}`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
            <h2>Cleanliness Violation Alert</h2>
            <p><strong>A new cleanliness violation has been detected automatically.</strong></p>
            <ul>
              <li><strong>Location:</strong> ${report.location?.name || 'Not provided'}</li>
              <li><strong>Description:</strong> ${report.description || 'None'}</li>
              <li><strong>Inspector:</strong> ${report.inspectorName}</li>
              <li><strong>Report ID:</strong> ${report.reportId}</li>
              <li><strong>Detected Labels:</strong> ${report.labels.map(l => l.name).join(', ')}</li>
            </ul>
            <p><strong>Image Evidence:</strong></p>
            <p><a href="${report.imageUrl}">Click here to view the uploaded image</a></p>
            <br/>
            <p><em>Please review this report in the officer dashboard to dispatch cleanup crews.</em></p>
          `,
        },
      },
    },
  };

  try {
    console.log(`📧 Sending SES violation alert to: ${officerEmails.join(', ')}`);
    const result = await ses.sendEmail(params).promise();
    console.log(`✅ SES email sent successfully. MessageId: ${result.MessageId}`);
    return result;
  } catch (error) {
    console.error('❌ SES Email failed to send:', error.message);
    // In sandbox mode, error 400 usually means emails aren't verified
    if (error.message.includes('Email address is not verified')) {
      console.error('   👉 Remember: In AWS sandbox mode, BOTH the sender and all recipients must be verified in the SES Console.');
    }
  }
};

module.exports = { sendViolationAlert };
