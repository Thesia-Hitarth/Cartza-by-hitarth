const buildHtmlTemplate = (title, bodyHtml) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            width: 100%;
            background-color: #f8fafc;
            padding: 40px 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.025);
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          .header {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            padding: 32px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.025em;
          }
          .content {
            padding: 40px 32px;
            color: #334155;
            line-height: 1.6;
          }
          .content p {
            margin: 0 0 20px 0;
            font-size: 16px;
          }
          .content p:last-child {
            margin: 0;
          }
          .button-wrapper {
            text-align: center;
            margin: 32px 0;
          }
          .button {
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 32px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1);
            transition: background-color 0.2s ease;
          }
          .button:hover {
            background-color: #4338ca;
          }
          .footer {
            background-color: #f1f5f9;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer p {
            margin: 0 0 8px 0;
            font-size: 14px;
            color: #64748b;
          }
          .footer p:last-child {
            margin: 0;
          }
          .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
          }
          .highlight {
            font-weight: 600;
            color: #0f172a;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <h1>CARTZA</h1>
            </div>
            <div class="content">
              ${bodyHtml}
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Cartza. All rights reserved.</p>
              <p>You are receiving this email because of your activity on our store.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

exports.resetEmail = (host, resetToken) => {
  const link = host.includes('http') ? `${host}/reset-password/${resetToken}` : `http://${host}/reset-password/${resetToken}`;
  const message = {
    subject: 'Reset Password',
    text:
      `You are receiving this because you have requested to reset your password for your account.\n\n` +
      `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
      `${link}\n\n` +
      `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    html: buildHtmlTemplate(
      'Reset Password',
      `
        <p>Hi,</p>
        <p>You are receiving this because you (or someone else) requested to reset the password for your account.</p>
        <p>Please click on the button below to complete the password reset process:</p>
        <div class="button-wrapper">
          <a href="${link}" class="button" target="_blank">Reset Password</a>
        </div>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <div class="divider"></div>
        <p style="font-size: 13px; color: #64748b;">If the button doesn't work, copy and paste this link into your browser: <br><a href="${link}" style="color: #4f46e5; word-break: break-all;">${link}</a></p>
      `
    )
  };

  return message;
};

exports.confirmResetPasswordEmail = () => {
  const message = {
    subject: 'Password Changed',
    text:
      `You are receiving this email because you changed your password. \n\n` +
      `If you did not request this change, please contact us immediately.`,
    html: buildHtmlTemplate(
      'Password Changed Successfully',
      `
        <p>Hi,</p>
        <p>Your password has been changed successfully. You can now log in using your new credentials.</p>
        <p><span class="highlight">Security Reminder:</span> If you did not request this change, please contact our support team immediately to secure your account.</p>
      `
    )
  };

  return message;
};

exports.merchantSignup = (host, { resetToken, email }) => {
  const link = host.includes('http') ? `${host}/merchant-signup/${resetToken}?email=${email}` : `http://${host}/merchant-signup/${resetToken}?email=${email}`;
  const message = {
    subject: 'Merchant Registration',
    text:
      `Congratulations! Your application has been accepted. Please complete your Merchant account signup by clicking on the link below. \n\n` +
      `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
      `${link}\n\n`,
    html: buildHtmlTemplate(
      'Merchant Account Approved',
      `
        <p>Congratulations!</p>
        <p>Your application for a merchant account on <span class="highlight">Cartza</span> has been accepted.</p>
        <p>Please click the button below to complete your Merchant account signup:</p>
        <div class="button-wrapper">
          <a href="${link}" class="button" target="_blank">Complete Signup</a>
        </div>
        <div class="divider"></div>
        <p style="font-size: 13px; color: #64748b;">If the button doesn't work, copy and paste this link into your browser: <br><a href="${link}" style="color: #4f46e5; word-break: break-all;">${link}</a></p>
      `
    )
  };

  return message;
};

exports.merchantWelcome = name => {
  const message = {
    subject: 'Merchant Registration',
    text:
      `Hi ${name}! Congratulations! Your application for merchant account has been accepted. \n\n` +
      `It looks like you already have a member account with us. Please sign in with your member credentials and you will be able to see your merchant account.`,
    html: buildHtmlTemplate(
      'Welcome to Cartza Merchants',
      `
        <p>Hi ${name},</p>
        <p>Congratulations! Your application for a merchant account on <span class="highlight">Cartza</span> has been accepted.</p>
        <p>It looks like you already have a member account with us. Please sign in with your existing member credentials and you will be able to view your merchant dashboard.</p>
      `
    )
  };

  return message;
};

exports.signupEmail = name => {
  const message = {
    subject: 'Account Registration',
    text: `Hi ${name.firstName} ${name.lastName}! Thank you for creating an account with us!.`,
    html: buildHtmlTemplate(
      'Welcome to Cartza',
      `
        <p>Hi ${name.firstName} ${name.lastName},</p>
        <p>Thank you for creating an account with us! We are thrilled to welcome you to the <span class="highlight">Cartza</span> community.</p>
        <p>You can now log in, explore our store, customize your profile, and start shopping.</p>
      `
    )
  };

  return message;
};

exports.newsletterSubscriptionEmail = () => {
  const message = {
    subject: 'Newsletter Subscription',
    text:
      `You are receiving this email because you subscribed to our newsletter. \n\n` +
      `If you did not request this change, please contact us immediately.`,
    html: buildHtmlTemplate(
      'Newsletter Subscribed',
      `
        <p>Hi there,</p>
        <p>You are receiving this email because you subscribed to our newsletter. You'll now receive updates on our latest products, special discounts, and news.</p>
        <p>If you did not request this subscription, please ignore this email or contact us immediately.</p>
      `
    )
  };

  return message;
};

exports.contactEmail = () => {
  const message = {
    subject: 'Contact Us',
    text: `We received your message! Our team will contact you soon. \n\n`,
    html: buildHtmlTemplate(
      'Message Received',
      `
        <p>Hi,</p>
        <p>Thank you for reaching out to us! We have successfully received your message.</p>
        <p>Our support team is reviewing it and will get back to you as soon as possible.</p>
      `
    )
  };

  return message;
};

exports.merchantApplicationEmail = () => {
  const message = {
    subject: 'Sell on CARTZA',
    text: `We received your request! Our team will contact you soon. \n\n`,
    html: buildHtmlTemplate(
      'Application Received',
      `
        <p>Hi,</p>
        <p>We have successfully received your application to sell on <span class="highlight">Cartza</span>.</p>
        <p>Our review team will look over your business details and contact you soon regarding your onboarding status.</p>
      `
    )
  };

  return message;
};

exports.merchantDeactivateAccount = () => {
  const message = {
    subject: 'Merchant account on CARTZA',
    text:
      `Your merchant account has been disabled. \n\n` +
      `Please contact admin to request access again.`,
    html: buildHtmlTemplate(
      'Account Disabled',
      `
        <p>Hi,</p>
        <p>Your merchant account on <span class="highlight">Cartza</span> has been disabled.</p>
        <p>If you believe this is in error or would like to request access again, please contact the administrator.</p>
      `
    )
  };

  return message;
};

exports.orderConfirmationEmail = order => {
  const message = {
    subject: `Order Confirmation ${order._id}`,
    text:
      `Hi ${order.user.firstName}! Thank you for your order!. \n\n` +
      `We've received your order and will contact you as soon as your package is shipped. \n\n`,
    html: buildHtmlTemplate(
      'Order Confirmed',
      `
        <p>Hi ${order.user.firstName},</p>
        <p>Thank you for your order! We have received your order <span class="highlight">#${order._id}</span> and are preparing it for shipment.</p>
        <p>We will contact you again as soon as your package is shipped. Below are your order details:</p>
        <div class="divider"></div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0;">
              <th style="text-align: left; padding: 8px 0; font-size: 14px; color: #64748b;">Product</th>
              <th style="text-align: center; padding: 8px 0; font-size: 14px; color: #64748b; width: 60px;">Qty</th>
              <th style="text-align: right; padding: 8px 0; font-size: 14px; color: #64748b; width: 80px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.products.map(item => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 0; font-size: 15px;">
                  <span style="font-weight: 600; color: #0f172a;">${item.product.name}</span>
                  ${item.product.brand ? `<br><span style="font-size: 12px; color: #64748b;">by ${item.product.brand.name}</span>` : ''}
                </td>
                <td style="text-align: center; padding: 12px 0; font-size: 15px; color: #64748b;">${item.quantity}</td>
                <td style="text-align: right; padding: 12px 0; font-size: 15px; font-weight: 600; color: #0f172a;">₹${(item.purchasePrice || item.product.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0; margin-top: 16px;">
          <table style="width: 100%; border-collapse: collapse; font-family: inherit;">
            <tr>
              <td style="font-size: 14px; color: #64748b; padding: 4px 0;">Subtotal</td>
              <td style="font-size: 14px; color: #0f172a; text-align: right; padding: 4px 0; font-weight: 600;">₹${order.total.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="font-size: 14px; color: #64748b; padding: 4px 0;">Est. Sales Tax</td>
              <td style="font-size: 14px; color: #0f172a; text-align: right; padding: 4px 0; font-weight: 600;">₹${(order.totalTax || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="font-size: 14px; color: #64748b; padding: 4px 0;">Shipping & Handling</td>
              <td style="font-size: 14px; color: #0f172a; text-align: right; padding: 4px 0; font-weight: 600;">₹0.00</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="font-size: 16px; font-weight: 700; color: #0f172a; padding: 8px 0 0 0;">Total</td>
              <td style="font-size: 16px; font-weight: 700; color: #0f172a; text-align: right; padding: 8px 0 0 0;">₹${(order.totalWithTax || order.total).toFixed(2)}</td>
            </tr>
          </table>
        </div>
      `
    )
  };

  return message;
};

exports.orderCancellationEmail = order => {
  const message = {
    subject: `Order Cancelled ${order._id}`,
    text:
      `Hi ${order.user.firstName}! Your order #${order._id} has been cancelled. \n\n` +
      `We've processed your cancellation. If this was an error, please contact support. \n\n`,
    html: buildHtmlTemplate(
      'Order Cancelled',
      `
        <p>Hi ${order.user.firstName},</p>
        <p>Your order <span class="highlight">#${order._id}</span> has been successfully cancelled.</p>
        <p>We've processed your cancellation. If this was an error or you need assistance, please reach out to our support team.</p>
        <div class="divider"></div>
        <p style="font-size: 14px; color: #64748b;">Below are the details of the cancelled order:</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0;">
              <th style="text-align: left; padding: 8px 0; font-size: 14px; color: #64748b;">Product</th>
              <th style="text-align: center; padding: 8px 0; font-size: 14px; color: #64748b; width: 60px;">Qty</th>
              <th style="text-align: right; padding: 8px 0; font-size: 14px; color: #64748b; width: 80px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.products.map(item => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 0; font-size: 15px;">
                  <span style="font-weight: 600; color: #0f172a;">${item.product.name}</span>
                  ${item.product.brand ? `<br><span style="font-size: 12px; color: #64748b;">by ${item.product.brand.name}</span>` : ''}
                </td>
                <td style="text-align: center; padding: 12px 0; font-size: 15px; color: #64748b;">${item.quantity}</td>
                <td style="text-align: right; padding: 12px 0; font-size: 15px; font-weight: 600; color: #0f172a;">₹${(item.purchasePrice || item.product.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e2e8f0; margin-top: 16px;">
          <table style="width: 100%; border-collapse: collapse; font-family: inherit;">
            <tr>
              <td style="font-size: 14px; color: #64748b; padding: 4px 0;">Subtotal Cancelled</td>
              <td style="font-size: 14px; color: #0f172a; text-align: right; padding: 4px 0; font-weight: 600;">₹${order.total.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="font-size: 14px; color: #64748b; padding: 4px 0;">Sales Tax Refunded</td>
              <td style="font-size: 14px; color: #0f172a; text-align: right; padding: 4px 0; font-weight: 600;">₹${(order.totalTax || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="font-size: 14px; color: #64748b; padding: 4px 0;">Shipping & Handling Refunded</td>
              <td style="font-size: 14px; color: #0f172a; text-align: right; padding: 4px 0; font-weight: 600;">₹0.00</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="font-size: 16px; font-weight: 700; color: #0f172a; padding: 8px 0 0 0;">Total Refunded</td>
              <td style="font-size: 16px; font-weight: 700; color: #0f172a; text-align: right; padding: 8px 0 0 0;">₹${(order.totalWithTax || order.total).toFixed(2)}</td>
            </tr>
          </table>
        </div>
      `
    )
  };

  return message;
};

exports.contactReplyEmail = (reply, originalMessage) => {
  const message = {
    subject: 'Solution to your Support Request',
    text: `Hi,\n\nWe have a solution to your query:\n\n${reply}\n\nYour original message:\n"${originalMessage}"`,
    html: buildHtmlTemplate(
      'Support Ticket Solution',
      `
        <p>Hi,</p>
        <p>We have processed your inquiry and have a solution to your query:</p>
        <div style="background-color: #f1f5f9; border-left: 4px solid #ff3d00; padding: 16px; margin: 20px 0; border-radius: 8px;">
          <p style="margin: 0; font-weight: 500; color: #0d0d0d;">${reply}</p>
        </div>
        <div class="divider"></div>
        <p style="font-size: 14px; color: #6b7280;"><strong>Your original message:</strong></p>
        <p style="font-size: 14px; color: #6b7280; font-style: italic;">"${originalMessage}"</p>
      `
    )
  };

  return message;
};

exports.verifyEmail = (host, token) => {
  const link = host.includes('http') ? `${host}/verify-email/${token}` : `http://${host}/verify-email/${token}`;
  return {
    subject: 'Email Verification Required',
    text: `Please verify your email address by clicking on the link below:\n\n${link}\n\n`,
    html: buildHtmlTemplate(
      'Email Verification Required',
      `
        <p>Hi,</p>
        <p>Thank you for registering on Cartza! Please click the button below to verify your email address and activate your account:</p>
        <div class="button-wrapper">
          <a href="${link}" class="button" target="_blank">Verify Email</a>
        </div>
        <div class="divider"></div>
        <p style="font-size: 13px; color: #64748b;">If the button doesn't work, copy and paste this link into your browser: <br><a href="${link}" style="color: #4f46e5; word-break: break-all;">${link}</a></p>
      `
    )
  };
};
