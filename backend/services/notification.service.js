const db = require('../config/database');

class NotificationService {
  /**
   * Create and send notification to user
   * @param {Object} data - Notification data
   * @param {string} data.userId - Target user ID
   * @param {string} data.type - Notification type
   * @param {string} data.title - Notification title
   * @param {string} data.message - Notification message
   * @param {string} data.link - Optional link
   */
  async sendNotification({ userId, type, title, message, link }) {
    try {
      const result = await db.query(
        `INSERT INTO notifications (user_id, type, title, message, link, is_read)
         VALUES ($1, $2, $3, $4, $5, false)
         RETURNING *`,
        [userId, type, title, message, link || null]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Send notification error:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendBulkNotifications(notifications) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      let count = 0;
      for (const notification of notifications) {
        await client.query(
          `INSERT INTO notifications (user_id, type, title, message, link, is_read)
           VALUES ($1, $2, $3, $4, $5, false)`,
          [
            notification.userId,
            notification.type,
            notification.title,
            notification.message,
            notification.link || null
          ]
        );
        count++;
      }

      await client.query('COMMIT');
      
      return { count };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Send bulk notifications error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false }) {
    try {
      const offset = (page - 1) * limit;
      
      let whereClause = 'WHERE user_id = $1';
      const params = [userId];
      
      if (unreadOnly) {
        whereClause += ' AND is_read = false';
      }

      const notificationsResult = await db.query(
        `SELECT * FROM notifications
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, parseInt(limit), offset]
      );

      const totalResult = await db.query(
        `SELECT COUNT(*) as count FROM notifications ${whereClause}`,
        [userId]
      );

      const unreadResult = await db.query(
        `SELECT COUNT(*) as count FROM notifications 
         WHERE user_id = $1 AND is_read = false`,
        [userId]
      );

      const total = parseInt(totalResult.rows[0].count);

      return {
        notifications: notificationsResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
        unreadCount: parseInt(unreadResult.rows[0].count),
      };
    } catch (error) {
      console.error('Get user notifications error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const result = await db.query(
        `UPDATE notifications 
         SET is_read = true
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [notificationId, userId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    try {
      const result = await db.query(
        `UPDATE notifications 
         SET is_read = true
         WHERE user_id = $1 AND is_read = false
         RETURNING *`,
        [userId]
      );

      return { count: result.rowCount };
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    try {
      const result = await db.query(
        `DELETE FROM notifications 
         WHERE id = $1 AND user_id = $2
         RETURNING *`,
        [notificationId, userId]
      );

      return { count: result.rowCount };
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }

  /**
   * Delete old notifications (cleanup)
   */
  async deleteOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await db.query(
        `DELETE FROM notifications 
         WHERE created_at < $1 AND is_read = true
         RETURNING *`,
        [cutoffDate]
      );

      console.log(`Deleted ${result.rowCount} old notifications`);
      return { count: result.rowCount };
    } catch (error) {
      console.error('Delete old notifications error:', error);
      throw error;
    }
  }

  /**
   * Send session reminder notifications
   */
  async sendSessionReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(23, 59, 59, 999);

      // Get sessions scheduled for tomorrow
      const sessionsResult = await db.query(
        `SELECT 
           gs.*,
           m.nama as mahasiswa_nama,
           m.user_id as mahasiswa_user_id,
           tp.id as thesis_project_id
         FROM guidance_sessions gs
         JOIN thesis_projects tp ON gs.thesis_project_id = tp.id
         JOIN mahasiswa m ON tp.mahasiswa_id = m.id
         WHERE gs.scheduled_date >= $1 
         AND gs.scheduled_date <= $2
         AND gs.status = 'APPROVED'`,
        [tomorrow, tomorrowEnd]
      );

      const sessions = sessionsResult.rows;

      // Get supervisors for each session
      const notifications = [];

      for (const session of sessions) {
        const supervisorsResult = await db.query(
          `SELECT d.nama, d.user_id
           FROM thesis_supervisors ts
           JOIN dosen d ON ts.dosen_id = d.id
           WHERE ts.thesis_project_id = $1`,
          [session.thesis_project_id]
        );

        const dateStr = tomorrow.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // Notify mahasiswa
        notifications.push({
          userId: session.mahasiswa_user_id,
          type: 'SESSION_REMINDER',
          title: 'Pengingat Bimbingan Besok',
          message: `Anda memiliki jadwal bimbingan besok, ${dateStr} pukul ${session.start_time} di ${session.location}`,
          link: `/mahasiswa/sessions/${session.id}`,
        });

        // Notify dosen(s)
        for (const supervisor of supervisorsResult.rows) {
          notifications.push({
            userId: supervisor.user_id,
            type: 'SESSION_REMINDER',
            title: 'Pengingat Bimbingan Besok',
            message: `Bimbingan dengan ${session.mahasiswa_nama} besok, ${dateStr} pukul ${session.start_time}`,
            link: `/dosen/sessions/${session.id}`,
          });
        }
      }

      if (notifications.length > 0) {
        await this.sendBulkNotifications(notifications);
        console.log(`Sent ${notifications.length} session reminders`);
      }

      return { count: notifications.length };
    } catch (error) {
      console.error('Send session reminders error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();