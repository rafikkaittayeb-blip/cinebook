import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const OWNER_EMAIL = 'el.rafik@aucegypt.edu'

export async function sendOTPEmail(email: string, name: string, otp: string) {
  await resend.emails.send({
    from: 'CineBook <onboarding@resend.dev>',
    to: OWNER_EMAIL,
    subject: `Your CineBook verification code: ${otp}`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; padding: 0; background: #0a0a0a; font-family: 'Segoe UI', Arial, sans-serif; }
  .wrap { max-width: 520px; margin: 0 auto; padding: 40px 24px; }
  .logo { color: #D4AF37; font-size: 22px; font-weight: 900; letter-spacing: 1px; margin-bottom: 32px; }
  .card { background: #111; border: 1px solid #2a2a2a; border-radius: 16px; padding: 32px; }
  h1 { color: #ffffff; font-size: 22px; margin: 0 0 8px; }
  .sub { color: #9ca3af; font-size: 14px; margin: 0 0 28px; line-height: 1.6; }
  .otp-box { background: #0d0d0d; border: 1px solid #2a2a2a; border-radius: 12px; padding: 24px 16px; text-align: center; margin: 0 0 24px; }
  .otp { font-size: 44px; font-weight: 900; color: #D4AF37; letter-spacing: 14px; font-family: monospace; }
  .note { color: #6b7280; font-size: 13px; margin: 0; line-height: 1.5; }
  .footer { margin-top: 28px; padding-top: 20px; border-top: 1px solid #1a1a1a; }
  .footer p { color: #374151; font-size: 12px; margin: 0 0 4px; line-height: 1.5; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">🎬 CineBook</div>
  <div class="card">
    <h1>Verification Code</h1>
    <p class="sub">Hi ${name}, use the code below to verify your identity. It expires in 10 minutes.</p>
    <div class="otp-box">
      <div class="otp">${otp}</div>
    </div>
    <p class="note">Never share this code with anyone. CineBook will never ask for it.</p>
  </div>
  <div class="footer">
    <p>You're receiving this because a sign-in was requested for ${email}.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  </div>
</div>
</body>
</html>`,
  })
}

interface BookingConfirmationData {
  ref: string
  movieTitle: string
  date: string
  time: string
  format: string
  seats: string[]
  total: number
  qrCodeDataUrl: string
}

export async function sendBookingConfirmation(
  email: string,
  name: string,
  booking: BookingConfirmationData
) {
  const seatList = booking.seats.join(', ')
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(booking.ref)}&margin=10`

  await resend.emails.send({
    from: 'CineBook <onboarding@resend.dev>',
    to: OWNER_EMAIL,
    subject: `Booking Confirmed — ${booking.movieTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; padding: 0; background: #0a0a0a; font-family: 'Segoe UI', Arial, sans-serif; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
  .logo { color: #D4AF37; font-size: 22px; font-weight: 900; letter-spacing: 1px; margin-bottom: 32px; }
  .hero { background: #111; border: 1px solid #2a2a2a; border-radius: 16px; padding: 32px; margin-bottom: 16px; }
  h1 { color: #ffffff; font-size: 24px; text-align: center; margin: 0 0 6px; }
  .subtitle { color: #9ca3af; font-size: 14px; text-align: center; margin: 0 0 28px; }
  .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1a1a1a; }
  .detail-row:last-child { border-bottom: none; }
  .label { color: #6b7280; font-size: 13px; }
  .value { color: #ffffff; font-size: 13px; font-weight: 600; }
  .value.gold { color: #D4AF37; }
  .ref-box { background: #0d0d0d; border: 1px solid #2a2a2a; border-radius: 10px; padding: 16px; text-align: center; margin-top: 20px; }
  .ref { font-family: monospace; font-size: 20px; font-weight: 900; color: #D4AF37; letter-spacing: 3px; }
  .qr-section { background: #fff; border-radius: 12px; padding: 20px; text-align: center; margin-top: 16px; }
  .qr-label { color: #111; font-size: 12px; font-family: monospace; font-weight: 700; margin-top: 8px; }
  .info-box { background: #111; border: 1px solid #1a1a1a; border-radius: 12px; padding: 16px 20px; margin-top: 16px; }
  .info-box p { color: #6b7280; font-size: 13px; margin: 0 0 4px; line-height: 1.6; }
  .footer { margin-top: 28px; }
  .footer p { color: #374151; font-size: 12px; margin: 0 0 4px; line-height: 1.5; text-align: center; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">🎬 CineBook</div>
  <div class="hero">
    <div style="text-align:center;font-size:48px;margin-bottom:12px;">✅</div>
    <h1>Booking Confirmed!</h1>
    <p class="subtitle">Hi ${name}, your tickets are ready. Enjoy the show!</p>
    <div class="detail-row"><span class="label">Movie</span><span class="value">${booking.movieTitle}</span></div>
    <div class="detail-row"><span class="label">Date</span><span class="value">${booking.date}</span></div>
    <div class="detail-row"><span class="label">Time</span><span class="value">${booking.time}</span></div>
    <div class="detail-row"><span class="label">Format</span><span class="value gold">${booking.format}</span></div>
    <div class="detail-row"><span class="label">Seats</span><span class="value gold">${seatList}</span></div>
    <div class="detail-row"><span class="label">Total Paid</span><span class="value gold">EGP ${booking.total.toFixed(2)}</span></div>
    <div class="ref-box">
      <div style="color:#6b7280;font-size:12px;margin-bottom:6px;">BOOKING REFERENCE</div>
      <div class="ref">${booking.ref}</div>
    </div>
  </div>
  <div class="qr-section">
    <img src="${qrUrl}" alt="QR Code" width="160" height="160" style="display:block;margin:0 auto;" />
    <div class="qr-label">${booking.ref}</div>
  </div>
  <div class="info-box">
    <p>📍 Show this QR code at the cinema entrance.</p>
    <p>⏰ Please arrive at least 15 minutes before showtime.</p>
    <p>❌ Cancellations allowed up to 2 hours before the show.</p>
  </div>
  <div class="footer">
    <p>Thank you for choosing CineBook!</p>
    <p style="margin-top:8px;color:#1f2937;">© 2026 CineBook — Cinema Booking System</p>
  </div>
</div>
</body>
</html>`,
  })
}

interface ReminderData {
  ref: string
  movieTitle: string
  date: string
  time: string
  format: string
  seats: string[]
}

export async function sendReminderEmail(email: string, name: string, booking: ReminderData) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(booking.ref)}&margin=10`
  const seatList = booking.seats.join(', ')

  await resend.emails.send({
    from: 'CineBook <onboarding@resend.dev>',
    to: OWNER_EMAIL,
    subject: `🎬 Reminder: ${booking.movieTitle} is tomorrow!`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { margin: 0; padding: 0; background: #0a0a0a; font-family: 'Segoe UI', Arial, sans-serif; }
  .wrap { max-width: 520px; margin: 0 auto; padding: 40px 24px; }
  .logo { color: #D4AF37; font-size: 22px; font-weight: 900; margin-bottom: 32px; }
  .card { background: #111; border: 1px solid #2a2a2a; border-radius: 16px; padding: 32px; }
  h1 { color: #fff; font-size: 22px; margin: 0 0 6px; }
  .sub { color: #9ca3af; font-size: 14px; margin: 0 0 24px; }
  .detail-row { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid #1a1a1a; }
  .detail-row:last-child { border-bottom: none; }
  .label { color: #6b7280; font-size: 13px; }
  .value { color: #fff; font-size: 13px; font-weight: 600; }
  .value.gold { color: #D4AF37; }
  .qr-section { background: #fff; border-radius: 12px; padding: 16px; text-align: center; margin-top: 20px; }
  .qr-label { color: #111; font-size: 11px; font-family: monospace; font-weight: 700; margin-top: 6px; }
  .tip { background: #1a1a0a; border: 1px solid #D4AF37/20; border-radius: 10px; padding: 14px 18px; margin-top: 16px; color: #9ca3af; font-size: 13px; line-height: 1.6; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">🎬 CineBook</div>
  <div class="card">
    <div style="font-size:40px;margin-bottom:12px;">⏰</div>
    <h1>Your movie is tomorrow!</h1>
    <p class="sub">Hi ${name}, just a friendly reminder about your upcoming reservation.</p>
    <div class="detail-row"><span class="label">Movie</span><span class="value">${booking.movieTitle}</span></div>
    <div class="detail-row"><span class="label">Date</span><span class="value">${booking.date}</span></div>
    <div class="detail-row"><span class="label">Time</span><span class="value gold">${booking.time}</span></div>
    <div class="detail-row"><span class="label">Format</span><span class="value">${booking.format}</span></div>
    <div class="detail-row"><span class="label">Seats</span><span class="value gold">${seatList}</span></div>
    <div class="detail-row"><span class="label">Ref</span><span class="value" style="font-family:monospace;">${booking.ref}</span></div>
    <div class="qr-section">
      <img src="${qrUrl}" alt="QR Code" width="140" height="140" style="display:block;margin:0 auto;" />
      <div class="qr-label">${booking.ref}</div>
    </div>
    <div class="tip">📍 Arrive at least 15 minutes early and have your QR code ready at the entrance.</div>
  </div>
</div>
</body>
</html>`,
  })
}
