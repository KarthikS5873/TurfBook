const nodemailer = require('nodemailer');

const isEmailConfigured = 
  process.env.EMAIL_USER && 
  process.env.EMAIL_USER !== 'your_gmail@gmail.com' &&
  process.env.EMAIL_PASS && 
  process.env.EMAIL_PASS !== 'your_app_password';

let transporter;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log('Nodemailer Gmail SMTP integration configured.');
} else {
  console.log('Gmail SMTP credentials missing or placeholders. Using mock mailer (console logs).');
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('\n=================== MOCK EMAIL SENT ===================');
      console.log(`From:    ${mailOptions.from || 'TurfBook TN <no-reply@turfbooktn.com>'}`);
      console.log(`To:      ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log('Content:');
      console.log(mailOptions.text || mailOptions.html);
      console.log('=======================================================\n');
      return {
        messageId: 'mock_mail_' + Math.random().toString(36).substring(2, 15),
        response: '250 Mock email accepted'
      };
    }
  };
}

module.exports = transporter;
