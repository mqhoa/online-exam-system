-- Keep the demo credentials documented in V4 usable with BCryptPasswordEncoder.
-- BCrypt hashes are one-way; the encoder in the application verifies them with matches().
UPDATE users
SET password_hash = '$2a$10$7hsqTf6D7m60kzfDKK/ZoubziUI0FXa0N6PggCuZQovGQiqnRgK26'
WHERE username = 'admin' AND role = 'ADMIN';

UPDATE users
SET password_hash = '$2a$10$1coufYrRFUbLIPTk0/HqCOjNLj6raj92D5oVpy3skSxMZ3S50N5aW'
WHERE username IN ('teacher', 'teacher01') AND role = 'TEACHER';

UPDATE users
SET password_hash = '$2a$10$WaaxKHmuafPUuSiF.qrxvuJE6YCL4U1CWo3xet0EnRmgajBndQAhG'
WHERE role = 'STUDENT';

-- There is no self-registration endpoint. This constraint also prevents a second
-- ADMIN account from being inserted directly into the database.
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_single_admin
    ON users (role)
    WHERE role = 'ADMIN';
