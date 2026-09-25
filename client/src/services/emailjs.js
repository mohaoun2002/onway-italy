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

  const fullMessage = message || notes || `New dossier submission for ${studyLevel || 'academic studies'} (${field || 'General'}). Target Universities: ${universitiesStr}. Contact: ${phone} (${wilaya}).`;

  // Provide comprehensive variable mapping to match any template variables configured in template_6r6ipuk
  const templateParams = {
    // Name variations
    name: fullName,
    fullName: fullName,
    from_name: fullName,
    user_name: fullName,
    applicant_name: fullName,

    // Email variations
    email: email,
    user_email: email,
    from_email: email,
    reply_to: email,

    // Target receiver
    to_email: EMAILJS_CONFIG.RECIPIENT_EMAIL,
    recipient: EMAILJS_CONFIG.RECIPIENT_EMAIL,

    // Contact & academic details
    phone: phone,
    wilaya: wilaya,
    studyLevel: studyLevel,
    field: field,
    universities: universitiesStr,
    tracking_id: trackingId || 'OWI-CONTACT',

    // Message variations
    message: fullMessage,
    notes: fullMessage,
    content: fullMessage,
    subject: `New OnWay Italy Message from ${fullName} (${wilaya || 'Algeria'})`
  };

  try {
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    console.log('[EmailJS] Notification successfully sent to italyoneway@gmail.com:', response.status, response.text);
    return { success: true, response };
  } catch (error) {
    console.error('[EmailJS Error] Failed to send email:', error);
    return { success: false, error };
  }
}
