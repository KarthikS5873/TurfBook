const Notification = require('../models/Notification');

const sendSMS = async ({ to, message, recipientId }) => {
  let status = 'pending';
  let error = null;

  try {
    console.log(`[SMS Mock] To: ${to} | Message: ${message}`);
    status = 'sent';
  } catch (err) {
    status = 'failed';
    error = err.message;
    console.error(`Failed sending SMS to ${to}:`, err.message);
  } finally {
    if (recipientId) {
      try {
        await Notification.create({
          recipient: recipientId,
          type: 'sms',
          emailAddress: to,
          subject: 'SMS Notification',
          body: message,
          status,
          error
        });
      } catch (logErr) {
        console.error('Failed logging SMS notification:', logErr.message);
      }
    }
  }

  return { success: status === 'sent', error };
};

module.exports = sendSMS;
