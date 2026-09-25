const nodemailer = require('nodemailer');

// SMTP and Notification Configuration
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true, // true for port 465
  auth: {
    user: process.env.SMTP_USER || 'italyoneway@gmail.com',
    pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD || ''
  },
  // Sender email configuration
  senderEmail: process.env.SMTP_FROM || 'OnWay Italy <italyoneway@gmail.com>',
  // Receiver for all incoming client application notifications
  notificationReceiver: process.env.NOTIFICATION_EMAIL || 'italyoneway@gmail.com'
};

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: EMAIL_CONFIG.host,
      port: EMAIL_CONFIG.port,
      secure: EMAIL_CONFIG.secure,
      auth: {
        user: EMAIL_CONFIG.auth.user,
        pass: EMAIL_CONFIG.auth.pass
      }
    });
  }
  return transporter;
}

/**
 * Sends an email notification to the administrator when a new client application is submitted.
 * @param {Object} application - The application record
 * @returns {Promise<{success: boolean, info?: any, simulated?: boolean}>}
 */
async function sendApplicationNotification(application) {
  const {
    id,
    fullName,
    email,
    phone,
    wilaya,
    studyLevel,
    field,
    universities,
    gpa,
    bacYear,
    currentDegree,
    consulate,
    statusNote,
    documents,
    createdAt
  } = application;

  const subject = `[New Application] Dossier ${id} - ${fullName} (${studyLevel} - ${field})`;

  const universitiesList = Array.isArray(universities)
    ? universities.join(', ')
    : universities || 'None selected';

  const documentsList = Array.isArray(documents) && documents.length > 0
    ? documents.map(d => `<li>${d.name} (${d.size || 'N/A'})</li>`).join('')
    : '<li>None attached</li>';

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #334155;">
      <div style="background: linear-gradient(135deg, #008C45, #065f46); padding: 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">OnWay Italy</h1>
        <p style="margin: 6px 0 0 0; color: #a7f3d0; font-size: 13px;">New Algerian Student Dossier Notification</p>
      </div>

      <div style="padding: 28px;">
        <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #008C45;">
          <div style="font-size: 12px; text-transform: uppercase; color: #94a3b8; font-weight: 700;">Tracking Reference</div>
          <div style="font-size: 20px; font-weight: 800; color: #34d399; margin-top: 4px;">${id}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Submitted: ${new Date(createdAt).toLocaleString('fr-FR', { timeZone: 'Africa/Algiers' })} (Algeria Time)</div>
        </div>

        <h3 style="color: #ffffff; font-size: 15px; margin: 0 0 12px 0; border-bottom: 1px solid #334155; padding-bottom: 8px;">Applicant Information</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; width: 140px;">Full Name:</td>
            <td style="padding: 6px 0; color: #f8fafc; font-weight: 600;">${fullName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Email:</td>
            <td style="padding: 6px 0; color: #38bdf8;"><a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Phone:</td>
            <td style="padding: 6px 0; color: #f8fafc; font-weight: 600;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Wilaya:</td>
            <td style="padding: 6px 0; color: #f8fafc;">${wilaya}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Jurisdiction:</td>
            <td style="padding: 6px 0; color: #fbbf24;">${consulate}</td>
          </tr>
        </table>

        <h3 style="color: #ffffff; font-size: 15px; margin: 0 0 12px 0; border-bottom: 1px solid #334155; padding-bottom: 8px;">Academic Background & Target</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; width: 140px;">Target Level:</td>
            <td style="padding: 6px 0; color: #34d399; font-weight: 600;">${studyLevel}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Target Field:</td>
            <td style="padding: 6px 0; color: #f8fafc;">${field}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Current Degree:</td>
            <td style="padding: 6px 0; color: #f8fafc;">${currentDegree} (Bac ${bacYear})</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">GPA / Mention:</td>
            <td style="padding: 6px 0; color: #f8fafc;">${gpa}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Target Universities:</td>
            <td style="padding: 6px 0; color: #f8fafc; font-weight: 600;">${universitiesList}</td>
          </tr>
        </table>

        <h3 style="color: #ffffff; font-size: 15px; margin: 0 0 12px 0; border-bottom: 1px solid #334155; padding-bottom: 8px;">Attached Documents</h3>
        <ul style="margin: 0 0 20px 0; padding-left: 20px; font-size: 13px; color: #94a3b8;">
          ${documentsList}
        </ul>

        ${statusNote ? `
          <div style="background: #1e293b; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #cbd5e1; margin-bottom: 20px;">
            <strong style="color: #94a3b8; display: block; margin-bottom: 4px;">Applicant Notes:</strong>
            ${statusNote}
          </div>
        ` : ''}

        <div style="text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid #334155;">
          <p style="font-size: 11px; color: #64748b; margin: 0;">
            This is an automated notification from OnWay Italy Admissions Portal sent to <strong>${EMAIL_CONFIG.notificationReceiver}</strong>.
          </p>
        </div>
      </div>
    </div>
  `;

  const textContent = `
OnWay Italy - New Client Application
-------------------------------------
Tracking Code: ${id}
Submitted: ${createdAt}

Applicant Details:
- Name: ${fullName}
- Email: ${email}
- Phone: ${phone}
- Wilaya: ${wilaya}
- Consular Jurisdiction: ${consulate}

Academic Target:
- Target Level: ${studyLevel}
- Field: ${field}
- Current Degree: ${currentDegree} (Bac: ${bacYear})
- GPA: ${gpa}
- Universities: ${universitiesList}

Attached Documents:
${Array.isArray(documents) && documents.length > 0 ? documents.map(d => `- ${d.name} (${d.size || 'N/A'})`).join('\n') : '- None'}

Notes: ${statusNote || 'None'}
  `.trim();

  // If no password configured yet in environment, log and simulate dispatch gracefully
  if (!EMAIL_CONFIG.auth.pass) {
    console.log(`[SMTP Notification] Recipient: ${EMAIL_CONFIG.notificationReceiver}`);
    console.log(`[SMTP Notification] Sender: ${EMAIL_CONFIG.senderEmail}`);
    console.log(`[SMTP Notification] Subject: ${subject}`);
    console.log(`[SMTP Notification] Notice: SMTP_PASS not set in environment. Notification logged cleanly without failure.`);
    return {
      success: true,
      simulated: true,
      message: 'Notification processed (SMTP credentials pending in environment)'
    };
  }

  try {
    const client = getTransporter();
    const info = await client.sendMail({
      from: EMAIL_CONFIG.senderEmail,
      to: EMAIL_CONFIG.notificationReceiver,
      replyTo: email,
      subject,
      text: textContent,
      html: htmlContent
    });

    console.log(`[SMTP Notification] Email successfully sent to ${EMAIL_CONFIG.notificationReceiver}. Message ID: ${info.messageId}`);
    return { success: true, info };
  } catch (error) {
    console.error(`[SMTP Notification Error] Failed to send email to ${EMAIL_CONFIG.notificationReceiver}:`, error.message);
    // Return error status but don't crash app
    return { success: false, error: error.message };
  }
}

module.exports = {
  EMAIL_CONFIG,
  sendApplicationNotification
};
