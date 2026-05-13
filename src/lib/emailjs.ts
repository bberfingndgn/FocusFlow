import emailjs from '@emailjs/browser';

// EmailJS ayarları — .env.local'e ekle:
// NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
// NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
// NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
const SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  || '';
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  || '';

export async function sendParentOtpEmail(params: {
  parentEmail: string;
  studentName: string;
  subject: string;
  durationMinutes: number;
  otpCode: string;
}): Promise<boolean> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    // EmailJS henüz yapılandırılmamış — geliştirme modunda OTP'yi konsola yaz
    console.info('[DEV] Parent OTP:', params.otpCode, '→', params.parentEmail);
    return true;
  }

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        to_email:        params.parentEmail,
        student_name:    params.studentName,
        subject_name:    params.subject,
        duration:        params.durationMinutes,
        otp_code:        params.otpCode,
        app_name:        'FocusFlow',
      },
      PUBLIC_KEY
    );
    return true;
  } catch (err) {
    console.error('EmailJS error:', err);
    return false;
  }
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
