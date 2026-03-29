CREATE DATABASE IF NOT EXISTS event_booking_db;
USE event_booking_db;

-- USER TABLE-- 

CREATE TABLE users (
    id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name   VARCHAR(100) NOT NULL,
    email  VARCHAR(100) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;


-- EVENT TABLE --
CREATE TABLE events (
  id                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  title             VARCHAR(200)  NOT NULL,
  description       TEXT,
  date              DATETIME      NOT NULL,
  total_capacity    INT UNSIGNED  NOT NULL,
  remaining_tickets INT UNSIGNED  NOT NULL,
  created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_events_date (date),
  CONSTRAINT chk_tickets CHECK (remaining_tickets <= total_capacity),
  CONSTRAINT chk_capacity_positive CHECK (total_capacity > 0)
) ENGINE=InnoDB;

-- Bookings Table
CREATE TABLE bookings (
  id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id      INT UNSIGNED  NOT NULL,
  event_id     INT UNSIGNED  NOT NULL,
  tickets_count INT UNSIGNED NOT NULL DEFAULT 1,
  booking_code CHAR(36)      NOT NULL,
  booking_date DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_booking_code  (booking_code),
  UNIQUE KEY uq_user_event    (user_id, event_id),
  KEY idx_bookings_user (user_id),
  KEY idx_bookings_event (event_id),
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- Event Attendance Table
CREATE TABLE event_attendance (
  id         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED  NOT NULL,
  event_id   INT UNSIGNED  NOT NULL,
  booking_id INT UNSIGNED  NOT NULL,
  entry_time DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_attendance_booking (booking_id),
  KEY idx_attendance_event (event_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (event_id)   REFERENCES events(id)   ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;


