import emailjs from '@emailjs/browser';

export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_7gzyqil',
  TEMPLATE_ID: 'template_6r6ipuk',
  PUBLIC_KEY: 'KD-gLBP3ks3YMRTR4',
  RECIPIENT_EMAIL: 'italyoneway@gmail.com'
};

// Initialize EmailJS with the public key
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

/**
 * Send an email notification via EmailJS
 * Ensures the applicant's email is explicitly mapped to reply_to, user_email, and embedded in the message.
 * @param {Object} params - Form data to map to template variables
 * @returns {Promise<{success: boolean, response?: any, error?: any}>}
 */
export async function sendEmailJSNotification(params) {
  const {
    fullName = '',
    email = '',
    phone = '',
    wilaya = '',
    studyLevel = '',
    field = '',
    universities = '',
    notes = '',
    message = '',
    trackingId = ''
  } = params;

  const universitiesStr = Array.isArray(universities)
    ? universities.join(', ')
    : universities || 'Not specified';

  // Build a structured, fail-safe message body that explicitly embeds the applicant's email
  let formattedMessage = '';
  if (message && message.includes(email)) {
    formattedMessage = message;
  } else {
    formattedMessage = [
      `APPLICANT EMAIL: ${email}`,
      `REPLY-TO: ${email}`,
      `FULL NAME: ${fullName}`,
      `PHONE / WHATSAPP: ${phone || 'Not provided'}`,
      `WILAYA: ${wilaya || 'Algeria'}`,
      trackingId ? `TRACKING CODE: ${trackingId}` : null,
      studyLevel ? `TARGET LEVEL: ${studyLevel}` : null,
      field ? `FIELD: ${field}` : null,
      universitiesStr && universitiesStr !== 'Not specified' ? `TARGET UNIVERSITIES: ${universitiesStr}` : null,
      '--------------------------------------------------',
      `MESSAGE / INQUIRY DETAILS:\n${message || notes || 'New dossier inquiry submitted.'}`,
      '--------------------------------------------------',
      `DIRECT REPLY ADDRESS: ${email}`
    ].filter(Boolean).join('\n');
  }

  // Provide comprehensive variable mapping to match any template variables configured in template_6r6ipuk
  const templateParams = {
    // Explicit email mappings for EmailJS
    email: email,
    user_email: email,
    from_email: email,
    reply_to: email,
    applicant_email: email,
    client_email: email,
    sender_email: email,

    // Name variables
    name: fullName,
    fullName: fullName,
    from_name: fullName,
    user_name: fullName,
    applicant_name: fullName,

    // Target recipient
    to_email: EMAILJS_CONFIG.RECIPIENT_EMAIL,
    recipient: EMAILJS_CONFIG.RECIPIENT_EMAIL,

    // Contact & academic details
    phone: phone,
    wilaya: wilaya,
    studyLevel: studyLevel,
    field: field,
    universities: universitiesStr,
    tracking_id: trackingId || 'OWI-INQUIRY',

    // Full message containing the applicant's email
    message: formattedMessage,
    notes: formattedMessage,
    content: formattedMessage,
    subject: `[OnWay Italy] Application/Inquiry from ${fullName} (${email})`
  };

  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('[EmailJS] Notification successfully sent to italyoneway@gmail.com with email:', email, response.status, response.text);
    return { success: true, response };
  } catch (error) {
    console.error('[EmailJS Error] Failed to send email:', error);
    return { success: false, error };
  }
}
