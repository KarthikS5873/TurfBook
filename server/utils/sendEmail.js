const transporter = require('../config/mailer');
const Notification = require('../models/Notification');

/**
 * Utility wrapper to send emails and save logs in Mongoose
 * @param {Object} options - Email parameters
 * @param {String} options.to - Recipient email address
 * @param {String} options.subject - Email subject line
 * @param {String} [options.text] - Plain text content
 * @param {String} [options.html] - HTML content
 * @param {String} options.recipientId - Recipient user model ObjectId for notification records
 */
const sendEmail = async ({ to, subject, html, text, recipientId }) => {
  let status = 'pending';
  let error = null;
  let responseInfo = null;

  try {
    responseInfo = await transporter.sendMail({
      from: `"TurfBook TN" <${process.env.EMAIL_USER || 'no-reply@turfbooktn.com'}>`,
      to,
      subject,
      text,
      html
    });
    status = 'sent';
  } catch (err) {
    status = 'failed';
    error = err.message;
    console.error(`Failed sending email to ${to}:`, err.message);
  } finally {
    if (recipientId) {
      try {
        await Notification.create({
          recipient: recipientId,
          emailAddress: to,
          subject,
          body: html || text || '',
          status,
          error
        });
      } catch (logErr) {
        console.error('Failed logging notification record:', logErr.message);
      }
    }
  }

  return { success: status === 'sent', error, responseInfo };
};

module.exports = sendEmail;
