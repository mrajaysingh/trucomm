const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendLoginCredentials(user, credentials) {
    const mailOptions = {
      from: `TruComm <${process.env.SMTP_USER}>`,
      to: user.workEmail,
      subject: 'Your TruComm Login Credentials',
      html: this.generateCredentialsEmail(user, credentials),
      attachments: [
        {
          filename: `trucomm-credentials-${credentials.username}.json`,
          content: JSON.stringify(credentials, null, 2),
          contentType: 'application/json'
        }
      ]
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Login credentials sent to ${user.workEmail}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  generateCredentialsEmail(user, credentials) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TruComm Login Credentials</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #3A29FF;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3A29FF;
            margin-bottom: 10px;
          }
          .credentials-box {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
          }
          .credential-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .credential-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .credential-label {
            font-weight: 600;
            color: #495057;
          }
          .credential-value {
            font-family: 'Courier New', monospace;
            background: #e9ecef;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: #3A29FF;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">TruComm</div>
            <h1>Welcome to TruComm!</h1>
            <p>Your secure communication platform is ready to use.</p>
          </div>

          <h2>Your Login Credentials</h2>
          <p>Hello ${user.firstName || 'User'},</p>
          <p>Your TruComm account has been successfully created. Below are your login credentials:</p>

          <div class="credentials-box">
            <div class="credential-item">
              <span class="credential-label">Username:</span>
              <span class="credential-value">${credentials.username}</span>
            </div>
            <div class="credential-item">
              <span class="credential-label">Login Email:</span>
              <span class="credential-value">${credentials.softwareLoginEmail}</span>
            </div>
            <div class="credential-item">
              <span class="credential-label">MMID:</span>
              <span class="credential-value">${credentials.mmid}</span>
            </div>
            <div class="credential-item">
              <span class="credential-label">Password:</span>
              <span class="credential-value">${credentials.password}</span>
            </div>
          </div>

          <div class="warning">
            <strong>⚠️ Important Security Notice:</strong>
            <ul>
              <li>Please save these credentials in a secure location</li>
              <li>Do not share your login details with anyone</li>
              <li>Change your password after first login</li>
              <li>Your credentials are also attached as a JSON file</li>
            </ul>
          </div>

          <h3>Next Steps:</h3>
          <ol>
            <li>Download and install the TruComm desktop application</li>
            <li>Use the provided credentials to log in</li>
            <li>Change your password in the application settings</li>
            <li>Explore the features available in your plan</li>
          </ol>

          <div style="text-align: center;">
            <a href="#" class="button">Download TruComm Desktop App</a>
          </div>

          <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
            <p>© 2024 TruComm. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: `TruComm <${process.env.SMTP_USER}>`,
      to: user.workEmail,
      subject: 'Welcome to TruComm - Getting Started Guide',
      html: this.generateWelcomeEmail(user)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${user.workEmail}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  }

  generateWelcomeEmail(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to TruComm</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #3A29FF;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3A29FF;
            margin-bottom: 10px;
          }
          .feature-list {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
          }
          .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
          }
          .feature-item:last-child {
            margin-bottom: 0;
          }
          .checkmark {
            color: #28a745;
            margin-right: 10px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">TruComm</div>
            <h1>Welcome to TruComm!</h1>
            <p>Your secure communication platform is ready to use.</p>
          </div>

          <h2>Getting Started with TruComm</h2>
          <p>Hello ${user.firstName || 'User'},</p>
          <p>Welcome to TruComm! We're excited to have you on board. Your account is now active and ready to use.</p>

          <h3>What's Included in Your Plan:</h3>
          <div class="feature-list">
            <div class="feature-item">
              <span class="checkmark">✓</span>
              <span>Secure messaging and file sharing</span>
            </div>
            <div class="feature-item">
              <span class="checkmark">✓</span>
              <span>End-to-end encryption</span>
            </div>
            <div class="feature-item">
              <span class="checkmark">✓</span>
              <span>Team collaboration tools</span>
            </div>
            <div class="feature-item">
              <span class="checkmark">✓</span>
              <span>Advanced security features</span>
            </div>
          </div>

          <h3>Quick Start Guide:</h3>
          <ol>
            <li>Download the TruComm desktop application</li>
            <li>Log in using your provided credentials</li>
            <li>Set up your profile and preferences</li>
            <li>Invite team members to collaborate</li>
            <li>Start secure communication!</li>
          </ol>

          <div class="footer">
            <p>Need help? Contact our support team anytime.</p>
            <p>© 2024 TruComm. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
