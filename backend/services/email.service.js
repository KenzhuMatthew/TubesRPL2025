const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
        text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendGuidanceRequestEmail(dosen, mahasiswa, scheduleDetails) {
    const subject = `Pengajuan Jadwal Bimbingan - ${mahasiswa.name}`;
    const html = `
      <h2>Pengajuan Jadwal Bimbingan Baru</h2>
      <p>Halo <strong>${dosen.name}</strong>,</p>
      <p>Mahasiswa berikut mengajukan jadwal bimbingan:</p>
      <ul>
        <li><strong>Nama:</strong> ${mahasiswa.name}</li>
        <li><strong>NIM:</strong> ${mahasiswa.nim}</li>
        <li><strong>Tanggal:</strong> ${scheduleDetails.date}</li>
        <li><strong>Waktu:</strong> ${scheduleDetails.time}</li>
        <li><strong>Lokasi:</strong> ${scheduleDetails.location}</li>
        <li><strong>Topik:</strong> ${scheduleDetails.topic || '-'}</li>
      </ul>
      <p>Silakan login ke sistem untuk menyetujui atau menolak pengajuan ini.</p>
      <p><a href="${process.env.FRONTEND_URL}/dosen/guidance-sessions">Lihat Pengajuan</a></p>
    `;

    return this.sendEmail({
      to: dosen.email,
      subject,
      html,
      text: `Pengajuan jadwal bimbingan dari ${mahasiswa.name} (${mahasiswa.nim})`
    });
  }

  async sendGuidanceApprovedEmail(mahasiswa, dosen, scheduleDetails) {
    const subject = `Jadwal Bimbingan Disetujui`;
    const html = `
      <h2>Jadwal Bimbingan Disetujui</h2>
      <p>Halo <strong>${mahasiswa.name}</strong>,</p>
      <p>Jadwal bimbingan Anda telah disetujui oleh <strong>${dosen.name}</strong>:</p>
      <ul>
        <li><strong>Tanggal:</strong> ${scheduleDetails.date}</li>
        <li><strong>Waktu:</strong> ${scheduleDetails.time}</li>
        <li><strong>Lokasi:</strong> ${scheduleDetails.location}</li>
        <li><strong>Dosen Pembimbing:</strong> ${dosen.name}</li>
      </ul>
      <p>Harap hadir tepat waktu dan siapkan materi yang akan dibimbingkan.</p>
      <p><a href="${process.env.FRONTEND_URL}/mahasiswa/guidance-history">Lihat Detail</a></p>
    `;

    return this.sendEmail({
      to: mahasiswa.email,
      subject,
      html,
      text: `Jadwal bimbingan Anda telah disetujui oleh ${dosen.name}`
    });
  }

  async sendGuidanceRejectedEmail(mahasiswa, dosen, scheduleDetails, reason) {
    const subject = `Jadwal Bimbingan Ditolak`;
    const html = `
      <h2>Jadwal Bimbingan Ditolak</h2>
      <p>Halo <strong>${mahasiswa.name}</strong>,</p>
      <p>Mohon maaf, jadwal bimbingan Anda ditolak oleh <strong>${dosen.name}</strong>:</p>
      <ul>
        <li><strong>Tanggal:</strong> ${scheduleDetails.date}</li>
        <li><strong>Waktu:</strong> ${scheduleDetails.time}</li>
        <li><strong>Alasan:</strong> ${reason || 'Tidak disebutkan'}</li>
      </ul>
      <p>Silakan ajukan jadwal baru melalui sistem.</p>
      <p><a href="${process.env.FRONTEND_URL}/mahasiswa/request-guidance">Ajukan Jadwal Baru</a></p>
    `;

    return this.sendEmail({
      to: mahasiswa.email,
      subject,
      html,
      text: `Jadwal bimbingan Anda ditolak oleh ${dosen.name}. Alasan: ${reason || '-'}`
    });
  }

  async sendGuidanceRescheduledEmail(recipient, rescheduler, oldSchedule, newSchedule) {
    const subject = `Jadwal Bimbingan Diubah`;
    const html = `
      <h2>Perubahan Jadwal Bimbingan</h2>
      <p>Halo <strong>${recipient.name}</strong>,</p>
      <p><strong>${rescheduler.name}</strong> mengubah jadwal bimbingan:</p>
      <h3>Jadwal Lama:</h3>
      <ul>
        <li><strong>Tanggal:</strong> ${oldSchedule.date}</li>
        <li><strong>Waktu:</strong> ${oldSchedule.time}</li>
        <li><strong>Lokasi:</strong> ${oldSchedule.location}</li>
      </ul>
      <h3>Jadwal Baru:</h3>
      <ul>
        <li><strong>Tanggal:</strong> ${newSchedule.date}</li>
        <li><strong>Waktu:</strong> ${newSchedule.time}</li>
        <li><strong>Lokasi:</strong> ${newSchedule.location}</li>
      </ul>
      <p><a href="${process.env.FRONTEND_URL}">Lihat Detail</a></p>
    `;

    return this.sendEmail({
      to: recipient.email,
      subject,
      html,
      text: `Jadwal bimbingan diubah oleh ${rescheduler.name}`
    });
  }

  async sendGuidanceCancelledEmail(recipient, canceller, scheduleDetails, reason) {
    const subject = `Jadwal Bimbingan Dibatalkan`;
    const html = `
      <h2>Jadwal Bimbingan Dibatalkan</h2>
      <p>Halo <strong>${recipient.name}</strong>,</p>
      <p><strong>${canceller.name}</strong> membatalkan jadwal bimbingan:</p>
      <ul>
        <li><strong>Tanggal:</strong> ${scheduleDetails.date}</li>
        <li><strong>Waktu:</strong> ${scheduleDetails.time}</li>
        <li><strong>Lokasi:</strong> ${scheduleDetails.location}</li>
        <li><strong>Alasan:</strong> ${reason || 'Tidak disebutkan'}</li>
      </ul>
      <p>Silakan atur jadwal pengganti melalui sistem.</p>
    `;

    return this.sendEmail({
      to: recipient.email,
      subject,
      html,
      text: `Jadwal bimbingan dibatalkan oleh ${canceller.name}. Alasan: ${reason || '-'}`
    });
  }

  async sendGuidanceReminderEmail(user, scheduleDetails, hoursBeforeGuidance) {
    const subject = `Pengingat: Bimbingan ${hoursBeforeGuidance} Jam Lagi`;
    const html = `
      <h2>Pengingat Bimbingan</h2>
      <p>Halo <strong>${user.name}</strong>,</p>
      <p>Anda memiliki jadwal bimbingan dalam <strong>${hoursBeforeGuidance} jam</strong>:</p>
      <ul>
        <li><strong>Tanggal:</strong> ${scheduleDetails.date}</li>
        <li><strong>Waktu:</strong> ${scheduleDetails.time}</li>
        <li><strong>Lokasi:</strong> ${scheduleDetails.location}</li>
        ${user.role === 'mahasiswa' ? `<li><strong>Dosen:</strong> ${scheduleDetails.dosenName}</li>` : ''}
        ${user.role === 'dosen' ? `<li><strong>Mahasiswa:</strong> ${scheduleDetails.mahasiswaNames}</li>` : ''}
      </ul>
      <p>Harap hadir tepat waktu.</p>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Pengingat: Bimbingan ${hoursBeforeGuidance} jam lagi`
    });
  }

  async sendMinimumGuidanceWarningEmail(mahasiswa, dosen, guidanceCount, minimumRequired, deadline) {
    const subject = `Peringatan: Jumlah Bimbingan Belum Mencukupi`;
    const html = `
      <h2>Peringatan Jumlah Bimbingan</h2>
      <p>Halo <strong>${mahasiswa.name}</strong>,</p>
      <p>Jumlah bimbingan Anda saat ini <strong>belum mencukupi</strong> syarat sidang:</p>
      <ul>
        <li><strong>Bimbingan Terdaftar:</strong> ${guidanceCount} kali</li>
        <li><strong>Minimum Diperlukan:</strong> ${minimumRequired} kali</li>
        <li><strong>Batas Waktu:</strong> ${deadline}</li>
      </ul>
      <p>Segera ajukan jadwal bimbingan dengan dosen pembimbing Anda: <strong>${dosen.name}</strong></p>
      <p><a href="${process.env.FRONTEND_URL}/mahasiswa/request-guidance">Ajukan Bimbingan</a></p>
    `;

    return this.sendEmail({
      to: mahasiswa.email,
      subject,
      html,
      text: `Peringatan: Jumlah bimbingan Anda (${guidanceCount}) belum mencukupi syarat sidang (${minimumRequired})`
    });
  }

  async sendWelcomeEmail(user, temporaryPassword) {
    const subject = `Selamat Datang di ${process.env.APP_NAME}`;
    const roleText = {
      admin: 'Administrator',
      dosen: 'Dosen Pembimbing',
      mahasiswa: 'Mahasiswa'
    };

    const html = `
      <h2>Selamat Datang di ${process.env.APP_NAME}</h2>
      <p>Halo <strong>${user.name}</strong>,</p>
      <p>Akun Anda telah dibuat dengan detail sebagai berikut:</p>
      <ul>
        <li><strong>Role:</strong> ${roleText[user.role]}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        ${user.nim ? `<li><strong>NIM:</strong> ${user.nim}</li>` : ''}
        ${user.nip ? `<li><strong>NIP:</strong> ${user.nip}</li>` : ''}
        <li><strong>Password Sementara:</strong> ${temporaryPassword}</li>
      </ul>
      <p><strong>PENTING:</strong> Segera login dan ubah password Anda untuk keamanan.</p>
      <p><a href="${process.env.FRONTEND_URL}/login">Login Sekarang</a></p>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Akun Anda telah dibuat. Email: ${user.email}, Password: ${temporaryPassword}`
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    const subject = `Reset Password - ${process.env.APP_NAME}`;
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <h2>Reset Password</h2>
      <p>Halo <strong>${user.name}</strong>,</p>
      <p>Anda menerima email ini karena ada permintaan reset password untuk akun Anda.</p>
      <p>Klik link berikut untuk reset password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>Link ini akan kedaluwarsa dalam 1 jam.</p>
      <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
    `;

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      text: `Reset password: ${resetLink}`
    });
  }

  async sendBulkEmail(recipients, subject, html, text) {
    const promises = recipients.map(recipient =>
      this.sendEmail({ to: recipient.email, subject, html, text })
    );

    const results = await Promise.allSettled(promises);
    
    return {
      total: recipients.length,
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length
    };
  }
}

module.exports = new EmailService();