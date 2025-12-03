-- ================================================
-- SIAP Bimbingan - PostgreSQL Database Schema
-- ================================================

-- Drop existing tables (careful in production!)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS guidance_notes CASCADE;
DROP TABLE IF EXISTS guidance_session_students CASCADE;
DROP TABLE IF EXISTS guidance_sessions CASCADE;
DROP TABLE IF EXISTS thesis_supervisors CASCADE;
DROP TABLE IF EXISTS thesis_projects CASCADE;
DROP TABLE IF EXISTS dosen_availabilities CASCADE;
DROP TABLE IF EXISTS mahasiswa_schedules CASCADE;
DROP TABLE IF EXISTS dosen_schedules CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS academic_periods CASCADE;
DROP TABLE IF EXISTS mahasiswa CASCADE;
DROP TABLE IF EXISTS dosen CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ================================================
-- ENUMS (using CHECK constraints)
-- ================================================

-- ================================================
-- TABLES
-- ================================================

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'DOSEN', 'MAHASISWA')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Dosen Table
CREATE TABLE dosen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    nip VARCHAR(50) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dosen_nip ON dosen(nip);
CREATE INDEX idx_dosen_user_id ON dosen(user_id);

-- Mahasiswa Table
CREATE TABLE mahasiswa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    npm VARCHAR(50) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    angkatan INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mahasiswa_npm ON mahasiswa(npm);
CREATE INDEX idx_mahasiswa_user_id ON mahasiswa(user_id);
CREATE INDEX idx_mahasiswa_angkatan ON mahasiswa(angkatan);

-- Academic Periods Table
CREATE TABLE academic_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    uts_date DATE NOT NULL,
    uas_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_academic_periods_semester ON academic_periods(semester);
CREATE INDEX idx_academic_periods_active ON academic_periods(is_active);

-- Rooms Table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    building VARCHAR(100) NOT NULL,
    capacity INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rooms_name ON rooms(name);
CREATE INDEX idx_rooms_active ON rooms(is_active);

-- Dosen Schedules Table (Jadwal Mengajar)
CREATE TABLE dosen_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dosen_id UUID NOT NULL REFERENCES dosen(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    room VARCHAR(100),
    semester VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dosen_schedules_dosen_id ON dosen_schedules(dosen_id);
CREATE INDEX idx_dosen_schedules_day ON dosen_schedules(day_of_week);
CREATE INDEX idx_dosen_schedules_semester ON dosen_schedules(semester);

-- Mahasiswa Schedules Table (Jadwal Kuliah)
CREATE TABLE mahasiswa_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mahasiswa_id UUID NOT NULL REFERENCES mahasiswa(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mahasiswa_schedules_mahasiswa_id ON mahasiswa_schedules(mahasiswa_id);
CREATE INDEX idx_mahasiswa_schedules_day ON mahasiswa_schedules(day_of_week);
CREATE INDEX idx_mahasiswa_schedules_semester ON mahasiswa_schedules(semester);

-- Dosen Availabilities Table
CREATE TABLE dosen_availabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dosen_id UUID NOT NULL REFERENCES dosen(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT TRUE,
    specific_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dosen_availabilities_dosen_id ON dosen_availabilities(dosen_id);
CREATE INDEX idx_dosen_availabilities_day ON dosen_availabilities(day_of_week);
CREATE INDEX idx_dosen_availabilities_date ON dosen_availabilities(specific_date);
CREATE INDEX idx_dosen_availabilities_active ON dosen_availabilities(is_active);

-- Thesis Projects Table
CREATE TABLE thesis_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mahasiswa_id UUID NOT NULL REFERENCES mahasiswa(id) ON DELETE CASCADE,
    judul TEXT NOT NULL,
    tipe VARCHAR(10) NOT NULL CHECK (tipe IN ('TA1', 'TA2')),
    semester VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_thesis_projects_mahasiswa_id ON thesis_projects(mahasiswa_id);
CREATE INDEX idx_thesis_projects_semester ON thesis_projects(semester);
CREATE INDEX idx_thesis_projects_status ON thesis_projects(status);
CREATE INDEX idx_thesis_projects_tipe ON thesis_projects(tipe);

-- Thesis Supervisors Table (Junction Table)
CREATE TABLE thesis_supervisors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thesis_project_id UUID NOT NULL REFERENCES thesis_projects(id) ON DELETE CASCADE,
    dosen_id UUID NOT NULL REFERENCES dosen(id) ON DELETE CASCADE,
    supervisor_order INTEGER NOT NULL CHECK (supervisor_order IN (1, 2)),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(thesis_project_id, dosen_id)
);

CREATE INDEX idx_thesis_supervisors_thesis_id ON thesis_supervisors(thesis_project_id);
CREATE INDEX idx_thesis_supervisors_dosen_id ON thesis_supervisors(dosen_id);

-- Guidance Sessions Table
CREATE TABLE guidance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thesis_project_id UUID NOT NULL REFERENCES thesis_projects(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    location VARCHAR(255) NOT NULL,
    session_type VARCHAR(20) DEFAULT 'INDIVIDUAL' CHECK (session_type IN ('INDIVIDUAL', 'GROUP')),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED')),
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guidance_sessions_thesis_id ON guidance_sessions(thesis_project_id);
CREATE INDEX idx_guidance_sessions_date ON guidance_sessions(scheduled_date);
CREATE INDEX idx_guidance_sessions_status ON guidance_sessions(status);
CREATE INDEX idx_guidance_sessions_created_by ON guidance_sessions(created_by);

-- Guidance Session Students (for group sessions)
CREATE TABLE guidance_session_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES guidance_sessions(id) ON DELETE CASCADE,
    mahasiswa_id UUID NOT NULL REFERENCES mahasiswa(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, mahasiswa_id)
);

CREATE INDEX idx_session_students_session_id ON guidance_session_students(session_id);
CREATE INDEX idx_session_students_mahasiswa_id ON guidance_session_students(mahasiswa_id);

-- Guidance Notes Table
CREATE TABLE guidance_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES guidance_sessions(id) ON DELETE CASCADE,
    dosen_id UUID NOT NULL REFERENCES dosen(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    tasks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guidance_notes_session_id ON guidance_notes(session_id);
CREATE INDEX idx_guidance_notes_dosen_id ON guidance_notes(dosen_id);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'SESSION_REQUESTED', 
        'SESSION_APPROVED', 
        'SESSION_REJECTED', 
        'SESSION_UPDATED', 
        'SESSION_CANCELLED', 
        'SESSION_REMINDER', 
        'NOTE_ADDED'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thesis_projects_updated_at BEFORE UPDATE ON thesis_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guidance_sessions_updated_at BEFORE UPDATE ON guidance_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guidance_notes_updated_at BEFORE UPDATE ON guidance_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE users IS 'User accounts for authentication';
COMMENT ON TABLE dosen IS 'Lecturer/supervisor profiles';
COMMENT ON TABLE mahasiswa IS 'Student profiles';
COMMENT ON TABLE thesis_projects IS 'Thesis projects (TA1/TA2)';
COMMENT ON TABLE guidance_sessions IS 'Guidance/supervision sessions';
COMMENT ON TABLE notifications IS 'System notifications';

-- ================================================
-- SUCCESS MESSAGE
-- ================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Tables: 15';
    RAISE NOTICE '🔗 Next: Run seed.sql to populate with sample data';
END $$;