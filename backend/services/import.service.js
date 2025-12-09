const db = require('../config/database');
const Papa = require('papaparse');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

class ImportService {
  /**
   * Parse CSV or Excel file
   */
  async parseFile(file) {
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (ext === '.csv') {
      return this.parseCSV(file.path);
    } else if (ext === '.xlsx' || ext === '.xls') {
      return await this.parseExcel(file.path);
    }
    
    throw new Error('Format file tidak didukung. Gunakan CSV atau Excel.');
  }

  /**
   * Parse CSV file
   */
  parseCSV(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const result = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
      dynamicTyping: false,
    });

    if (result.errors && result.errors.length > 0) {
      console.warn('CSV parsing warnings:', result.errors);
    }

    return result.data;
  }

  /**
   * Parse Excel file
   */
  async parseExcel(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1);
    const data = [];
    
    // Mendapatkan header dari baris pertama
    const headers = [];
    worksheet.getRow(1).eachCell((cell) => {
      headers.push(String(cell.value || '').trim());
    });
    
    // Membaca data dari baris-baris berikutnya
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header) {
            // Convert cell value to string, handle different types
            let cellValue = cell.value;
            if (cellValue !== null && cellValue !== undefined) {
              if (typeof cellValue === 'object' && cellValue.text) {
                cellValue = cellValue.text;
              } else if (typeof cellValue === 'number') {
                cellValue = String(cellValue);
              } else {
                cellValue = String(cellValue);
              }
            }
            rowData[header] = cellValue;
          }
        });
        
        // Only add row if it has at least one non-empty value
        if (Object.values(rowData).some(val => val !== null && val !== undefined && val !== '')) {
          data.push(rowData);
        }
      }
    });
    
    return data;
  }
  
  /**
   * Convert day name to day number
   */
  getDayOfWeek(dayName) {
    if (!dayName) return null;
    
    const days = {
      'minggu': 0, 'sunday': 0, 'sun': 0,
      'senin': 1, 'monday': 1, 'mon': 1,
      'selasa': 2, 'tuesday': 2, 'tue': 2,
      'rabu': 3, 'wednesday': 3, 'wed': 3,
      'kamis': 4, 'thursday': 4, 'thu': 4,
      'jumat': 5, 'friday': 5, 'fri': 5,
      'sabtu': 6, 'saturday': 6, 'sat': 6,
    };

    return days[String(dayName).toLowerCase()] ?? null;
  }

  /**
   * Normalize time format (HH:MM)
   */
  normalizeTime(timeStr) {
    if (!timeStr) return null;
    
    // Remove spaces and convert to string
    timeStr = String(timeStr).trim().replace(/\s+/g, '');
    
    // If already in HH:MM format
    if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
      const [hours, minutes] = timeStr.split(':');
      return `${hours.padStart(2, '0')}:${minutes}`;
    }
    
    // If in HHMM format
    if (/^\d{3,4}$/.test(timeStr)) {
      const hours = timeStr.slice(0, -2);
      const minutes = timeStr.slice(-2);
      return `${hours.padStart(2, '0')}:${minutes}`;
    }
    
    // If in H:MM or HH:M format
    if (/^\d{1,2}:\d{1,2}$/.test(timeStr)) {
      const [hours, minutes] = timeStr.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    
    return null;
  }

  /**
   * Get flexible column value - support multiple column name variations
   */
  getColumnValue(row, possibleNames) {
    for (const name of possibleNames) {
      if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
        return String(row[name]).trim();
      }
    }
    return null;
  }

  /**
   * Validate NPM format (10 digits)
   */
  validateNPM(npm) {
    if (!npm) return false;
    const npmStr = String(npm).trim();
    return /^\d{10}$/.test(npmStr);
  }

  /**
   * Validate NIDN format (10 digits)
   */
  validateNIDN(nidn) {
    if (!nidn) return false;
    const nidnStr = String(nidn).trim();
    return /^\d{10}$/.test(nidnStr);
  }

  /**
   * Import dosen schedules from CSV/Excel
   */
  async importDosenSchedules(file, semester) {
    const client = await db.getClient();
    
    try {
      const data = await this.parseFile(file);
      
      if (!data || data.length === 0) {
        throw new Error('File kosong atau tidak dapat dibaca');
      }

      let imported = 0;
      let failed = 0;
      const errors = [];

      await client.query('BEGIN');

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        try {
          const nidn = this.getColumnValue(row, [
            'NIDN', 'nidn', 'NIP', 'nip', 'Nidn', 'Nip', 
            'NIDN Dosen', 'NIP Dosen', 'nidn_dosen', 'nip_dosen'
          ]);
          
          if (!nidn) {
            throw new Error('NIDN/NIP tidak ditemukan atau kosong');
          }

          if (!this.validateNIDN(nidn)) {
            throw new Error(`NIDN/NIP tidak valid: "${nidn}". Harus 10 digit angka`);
          }

          const dosenResult = await client.query(
            'SELECT id, nama FROM dosen WHERE nip = $1',
            [nidn]
          );

          if (dosenResult.rows.length === 0) {
            throw new Error(`Dosen dengan NIDN/NIP ${nidn} tidak ditemukan di database`);
          }

          const dosen = dosenResult.rows[0];

          const hari = this.getColumnValue(row, [
            'Hari', 'hari', 'Day', 'day', 'Hari Mengajar', 'hari_mengajar'
          ]);
          
          if (!hari) {
            throw new Error('Kolom Hari tidak ditemukan atau kosong');
          }

          const dayOfWeek = this.getDayOfWeek(hari);
          
          if (dayOfWeek === null) {
            throw new Error(`Nama hari tidak valid: "${hari}"`);
          }

          const jamMulaiRaw = this.getColumnValue(row, [
            'Jam Mulai', 'jam_mulai', 'jamMulai', 'Start Time', 
            'startTime', 'Waktu Mulai', 'waktu_mulai'
          ]);
          
          const jamSelesaiRaw = this.getColumnValue(row, [
            'Jam Selesai', 'jam_selesai', 'jamSelesai', 'End Time', 
            'endTime', 'Waktu Selesai', 'waktu_selesai'
          ]);

          const startTime = this.normalizeTime(jamMulaiRaw);
          const endTime = this.normalizeTime(jamSelesaiRaw);

          if (!startTime) {
            throw new Error(`Jam mulai tidak valid: "${jamMulaiRaw}"`);
          }

          if (!endTime) {
            throw new Error(`Jam selesai tidak valid: "${jamSelesaiRaw}"`);
          }

          if (startTime >= endTime) {
            throw new Error(`Jam mulai harus lebih awal dari jam selesai`);
          }

          const courseName = this.getColumnValue(row, [
            'Mata Kuliah', 'mata_kuliah', 'mataKuliah', 'Course', 
            'course', 'Matkul', 'matkul', 'Nama Mata Kuliah'
          ]);
          
          if (!courseName) {
            throw new Error('Nama mata kuliah tidak ditemukan atau kosong');
          }

          const room = this.getColumnValue(row, [
            'Ruangan', 'ruangan', 'Room', 'room', 'Ruang', 'ruang',
            'Kode Ruangan', 'kode_ruangan'
          ]);

          const existingScheduleResult = await client.query(
            `SELECT id FROM dosen_schedules 
             WHERE dosen_id = $1 AND day_of_week = $2 
             AND start_time = $3 AND semester = $4`,
            [dosen.id, dayOfWeek, startTime, semester || 'Default']
          );

          if (existingScheduleResult.rows.length > 0) {
            await client.query(
              `UPDATE dosen_schedules 
               SET end_time = $1, course_name = $2, room = $3
               WHERE id = $4`,
              [endTime, courseName, room, existingScheduleResult.rows[0].id]
            );
          } else {
            await client.query(
              `INSERT INTO dosen_schedules 
               (dosen_id, day_of_week, start_time, end_time, course_name, room, semester)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [dosen.id, dayOfWeek, startTime, endTime, courseName, room, semester || 'Default']
            );
          }

          imported++;
        } catch (error) {
          failed++;
          errors.push({
            row: i + 2,
            nidn: row.NIDN || row.nidn || row.NIP || row.nip || '-',
            nama: row['Nama Dosen'] || row.nama || row.Nama || '-',
            error: error.message,
          });
        }
      }

      await client.query('COMMIT');

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        message: 'Import jadwal dosen selesai',
        success: imported,
        failed,
        total: data.length,
        errors: errors.slice(0, 20),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Import student data from CSV/Excel
   * Expected columns: NPM (10 digit), Nama, Email, Angkatan, Phone (optional)
   */
  async importStudentData(file, semester) {
    const client = await db.getClient();
    
    try {
      const data = await this.parseFile(file);
      
      if (!data || data.length === 0) {
        throw new Error('File kosong atau tidak dapat dibaca');
      }

      let imported = 0;
      let updated = 0;
      let failed = 0;
      const errors = [];

      await client.query('BEGIN');

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        try {
          const npm = this.getColumnValue(row, ['NPM', 'npm', 'Npm']);
          const nama = this.getColumnValue(row, ['Nama', 'nama', 'Name', 'name', 'Nama Mahasiswa']);
          const email = this.getColumnValue(row, ['Email', 'email', 'E-mail', 'e-mail']);
          const angkatanRaw = this.getColumnValue(row, ['Angkatan', 'angkatan', 'Year', 'year', 'Tahun']);
          const phone = this.getColumnValue(row, ['Phone', 'phone', 'Telepon', 'telepon', 'No HP', 'no_hp', 'HP']);

          if (!npm) {
            throw new Error('NPM tidak ditemukan atau kosong');
          }

          // Validate NPM format (10 digits)
          if (!this.validateNPM(npm)) {
            throw new Error(`NPM tidak valid: "${npm}". Harus 10 digit angka`);
          }

          if (!nama) {
            throw new Error('Nama tidak ditemukan atau kosong');
          }

          if (!email) {
            throw new Error('Email tidak ditemukan atau kosong');
          }

          const emailLower = email.toLowerCase();

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailLower)) {
            throw new Error(`Format email tidak valid: "${email}"`);
          }

          const angkatan = angkatanRaw ? parseInt(angkatanRaw) : new Date().getFullYear();

          // Validate angkatan
          if (isNaN(angkatan) || angkatan < 2000 || angkatan > new Date().getFullYear() + 1) {
            throw new Error(`Angkatan tidak valid: "${angkatanRaw}"`);
          }

          // Check if mahasiswa already exists
          const existingMahasiswaResult = await client.query(
            `SELECT m.*, u.email as user_email, u.id as user_id 
             FROM mahasiswa m 
             JOIN users u ON m.user_id = u.id 
             WHERE m.npm = $1`,
            [npm]
          );

          if (existingMahasiswaResult.rows.length > 0) {
            const existingMahasiswa = existingMahasiswaResult.rows[0];
            
            // Update existing mahasiswa
            await client.query(
              `UPDATE mahasiswa 
               SET nama = $1, email = $2, phone = $3, angkatan = $4
               WHERE npm = $5`,
              [nama, emailLower, phone, angkatan, npm]
            );

            // Update user email if different
            if (existingMahasiswa.user_email !== emailLower) {
              // Check if new email already used by another user
              const emailCheckResult = await client.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [emailLower, existingMahasiswa.user_id]
              );

              if (emailCheckResult.rows.length > 0) {
                throw new Error(`Email ${emailLower} sudah digunakan user lain`);
              }

              await client.query(
                'UPDATE users SET email = $1 WHERE id = $2',
                [emailLower, existingMahasiswa.user_id]
              );
            }

            updated++;
          } else {
            // Check if email already used
            const existingUserResult = await client.query(
              'SELECT id FROM users WHERE email = $1',
              [emailLower]
            );

            if (existingUserResult.rows.length > 0) {
              throw new Error(`Email ${emailLower} sudah terdaftar`);
            }

            // Create new mahasiswa with user account
            const defaultPassword = 'password123';
            const passwordHash = await bcrypt.hash(defaultPassword, 10);

            const userResult = await client.query(
              `INSERT INTO users (email, password_hash, role, is_active)
               VALUES ($1, $2, 'MAHASISWA', true)
               RETURNING id`,
              [emailLower, passwordHash]
            );

            const userId = userResult.rows[0].id;

            await client.query(
              `INSERT INTO mahasiswa (user_id, npm, nama, email, phone, angkatan)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [userId, npm, nama, emailLower, phone, angkatan]
            );

            imported++;
          }
        } catch (error) {
          failed++;
          errors.push({
            row: i + 2,
            npm: row.NPM || row.npm || '-',
            nama: row.Nama || row.nama || '-',
            error: error.message,
          });
        }
      }

      await client.query('COMMIT');

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        message: 'Import mahasiswa selesai',
        success: imported,
        updated,
        failed,
        total: data.length,
        errors: errors.slice(0, 20),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Import thesis projects with supervisors
   */
  async importThesisProjects(file, semester) {
    const client = await db.getClient();
    
    try {
      const data = await this.parseFile(file);
      
      if (!data || data.length === 0) {
        throw new Error('File kosong atau tidak dapat dibaca');
      }

      let imported = 0;
      let updated = 0;
      let failed = 0;
      const errors = [];

      await client.query('BEGIN');

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        try {
          const npm = this.getColumnValue(row, ['NPM', 'npm', 'Npm']);
          const judul = this.getColumnValue(row, ['Judul TA', 'judul_ta', 'judul', 'Title', 'Judul', 'Judul Tugas Akhir']);
          const tipeRaw = this.getColumnValue(row, ['Tipe', 'tipe', 'Type', 'type', 'Jenis', 'Jenis TA']);
          const nidn1 = this.getColumnValue(row, ['NIDN Pembimbing 1', 'nidn_pembimbing_1', 'NIP Pembimbing 1', 'nip1', 'nidn1', 'Pembimbing 1']);
          const nidn2 = this.getColumnValue(row, ['NIDN Pembimbing 2', 'nidn_pembimbing_2', 'NIP Pembimbing 2', 'nip2', 'nidn2', 'Pembimbing 2']);

          if (!npm) {
            throw new Error('NPM tidak ditemukan atau kosong');
          }

          if (!this.validateNPM(npm)) {
            throw new Error(`NPM tidak valid: "${npm}". Harus 10 digit angka`);
          }

          if (!judul) {
            throw new Error('Judul TA tidak ditemukan atau kosong');
          }

          if (!nidn1) {
            throw new Error('NIDN Pembimbing 1 tidak ditemukan atau kosong');
          }

          if (!this.validateNIDN(nidn1)) {
            throw new Error(`NIDN Pembimbing 1 tidak valid: "${nidn1}". Harus 10 digit angka`);
          }

          const tipe = tipeRaw && (tipeRaw.toUpperCase() === 'TA1' || tipeRaw.toUpperCase() === 'TA2') 
            ? tipeRaw.toUpperCase() 
            : 'TA1';

          // Find mahasiswa
          const mahasiswaResult = await client.query(
            'SELECT id FROM mahasiswa WHERE npm = $1',
            [npm]
          );

          if (mahasiswaResult.rows.length === 0) {
            throw new Error(`Mahasiswa dengan NPM ${npm} tidak ditemukan`);
          }

          const mahasiswa = mahasiswaResult.rows[0];

          // Find dosen pembimbing 1
          const dosen1Result = await client.query(
            'SELECT id FROM dosen WHERE nip = $1',
            [nidn1]
          );

          if (dosen1Result.rows.length === 0) {
            throw new Error(`Dosen dengan NIDN ${nidn1} tidak ditemukan`);
          }

          const dosen1 = dosen1Result.rows[0];

          // Find dosen pembimbing 2 (optional)
          let dosen2 = null;
          if (nidn2 && nidn2 !== '' && nidn2 !== '-') {
            if (!this.validateNIDN(nidn2)) {
              throw new Error(`NIDN Pembimbing 2 tidak valid: "${nidn2}". Harus 10 digit angka`);
            }

            const dosen2Result = await client.query(
              'SELECT id FROM dosen WHERE nip = $1',
              [nidn2]
            );

            if (dosen2Result.rows.length === 0) {
              throw new Error(`Dosen dengan NIDN ${nidn2} tidak ditemukan`);
            }

            dosen2 = dosen2Result.rows[0];
          }

          // Check if thesis project already exists for this semester
          const existingProjectResult = await client.query(
            `SELECT id FROM thesis_projects 
             WHERE mahasiswa_id = $1 AND semester = $2 AND status = 'ACTIVE'`,
            [mahasiswa.id, semester || 'Default']
          );

          if (existingProjectResult.rows.length > 0) {
            const projectId = existingProjectResult.rows[0].id;
            
            // Update existing project
            await client.query(
              `UPDATE thesis_projects 
               SET judul = $1, tipe = $2
               WHERE id = $3`,
              [judul, tipe, projectId]
            );

            // Delete old supervisors
            await client.query(
              'DELETE FROM thesis_supervisors WHERE thesis_project_id = $1',
              [projectId]
            );

            // Create new supervisors
            await client.query(
              `INSERT INTO thesis_supervisors (thesis_project_id, dosen_id, supervisor_order)
               VALUES ($1, $2, 1)`,
              [projectId, dosen1.id]
            );

            if (dosen2) {
              await client.query(
                `INSERT INTO thesis_supervisors (thesis_project_id, dosen_id, supervisor_order)
                 VALUES ($1, $2, 2)`,
                [projectId, dosen2.id]
              );
            }

            updated++;
          } else {
            // Create new thesis project
            const projectResult = await client.query(
              `INSERT INTO thesis_projects (mahasiswa_id, judul, tipe, semester, status)
               VALUES ($1, $2, $3, $4, 'ACTIVE')
               RETURNING id`,
              [mahasiswa.id, judul, tipe, semester || 'Default']
            );

            const projectId = projectResult.rows[0].id;

            // Create supervisors
            await client.query(
              `INSERT INTO thesis_supervisors (thesis_project_id, dosen_id, supervisor_order)
               VALUES ($1, $2, 1)`,
              [projectId, dosen1.id]
            );

            if (dosen2) {
              await client.query(
                `INSERT INTO thesis_supervisors (thesis_project_id, dosen_id, supervisor_order)
                 VALUES ($1, $2, 2)`,
                [projectId, dosen2.id]
              );
            }

            imported++;
          }
        } catch (error) {
          failed++;
          errors.push({
            row: i + 2,
            npm: row.NPM || row.npm || '-',
            judul: row['Judul TA'] || row.judul || '-',
            error: error.message,
          });
        }
      }

      await client.query('COMMIT');

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        message: 'Import tugas akhir selesai',
        success: imported,
        updated,
        failed,
        total: data.length,
        errors: errors.slice(0, 20),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new ImportService();