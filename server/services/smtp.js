const nodemailer = require('nodemailer');
const template = require('../config/template');
const keys = require('../config/keys');

const { host, port, user, pass, sender } = keys.smtp;

let transporter;
try {
  if (host && port) {
    transporter = nodemailer.createTransport({
      host: host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user: user,
        pass: pass
      }
    });
  } else {
    console.warn('Missing SMTP configuration. Transporter not initialized.');
  }
} catch (error) {
  console.warn('SMTP transporter initialization failed:', error);
}

exports.sendEmail = async (email, type, hostParam, data) => {
  try {
    const message = prepareTemplate(type, hostParam, data);

    if (!message) {
      throw new Error(`Email template not found for type: ${type}`);
    }

    const mailOptions = {
      from: `CARTZA! <${sender}>`,
      to: email,
      subject: message.subject,
      text: message.text,
      html: message.html
    };

    if (!transporter) {
      throw new Error('SMTP transporter is not initialized');
    }

    const info = await transporter.sendMail(mailOptions);
    return { success: true, info };
  } catch (error) {
    console.error(`[SMTP Error] Failed to send "${type}" email to ${email}:`, error);
    throw error;
  }
};

const prepareTemplate = (type, hostParam, data) => {
  let message;

  switch (type) {
    case 'reset':
      message = template.resetEmail(hostParam, data);
      break;

    case 'reset-confirmation':
      message = template.confirmResetPasswordEmail();
      break;

    case 'signup':
      message = template.signupEmail(data);
      break;

    case 'verify-email':
      message = template.verifyEmail(hostParam, data);
      break;

    case 'merchant-signup':
      message = template.merchantSignup(hostParam, data);
      break;

    case 'merchant-welcome':
      message = template.merchantWelcome(data);
      break;

    case 'newsletter-subscription':
      message = template.newsletterSubscriptionEmail();
      break;

    case 'contact':
      message = template.contactEmail();
      break;

    case 'contact-reply':
      message = template.contactReplyEmail(data.reply, data.message);
      break;

    case 'merchant-application':
      message = template.merchantApplicationEmail();
      break;

    case 'merchant-deactivate-account':
      message = template.merchantDeactivateAccount();
      break;

    case 'order-confirmation':
      message = template.orderConfirmationEmail(data);
      break;

    case 'order-cancellation':
      message = template.orderCancellationEmail(data);
      break;

    default:
      message = '';
  }

  return message;
};
