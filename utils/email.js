const nodemailer = require('nodemailer');

/*
// FOR GMAIL
const trasprt = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});
 */
const sendEmail = options => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: 'Anjan Poonacha <admin@admin.io>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html
  };
  transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
