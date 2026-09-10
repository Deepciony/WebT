import bcrypt from "bcryptjs";
import database from "../database.js";

async function ensureUsersTable() {
    await database.query(`
        CREATE TABLE IF NOT EXISTS users (
            "userId" SERIAL PRIMARY KEY,
            "username" VARCHAR(80) UNIQUE NOT NULL,
            "email" VARCHAR(160) UNIQUE NOT NULL,
            "passwordHash" TEXT NOT NULL,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

export async function register(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'กรุณากรอก username, email และ password' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
    }

    try {
        await ensureUsersTable();
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await database.query({
            text: `INSERT INTO users ("username", "email", "passwordHash")
                   VALUES ($1, $2, $3)
                   RETURNING "userId", "username", "email";`,
            values: [username.trim(), email.trim().toLowerCase(), passwordHash]
        });
        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', user: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Username หรือ email นี้ถูกใช้แล้ว' });
        }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function login(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'กรุณากรอก username และ password' });
    }

    try {
        await ensureUsersTable();
        const result = await database.query({
            text: `SELECT "userId", "username", "email", "passwordHash"
                   FROM users WHERE "username" = $1;`,
            values: [username.trim()]
        });
        const user = result.rows[0];
        const validPassword = user && await bcrypt.compare(password, user.passwordHash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Username หรือ password ไม่ถูกต้อง' });
        }

        res.status(200).json({
            message: 'เข้าสู่ระบบสำเร็จ',
            user: { userId: user.userId, username: user.username, email: user.email }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function changePassword(req, res) {
    const { username, currentPassword, newPassword } = req.body;

    if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });
    }

    try {
        await ensureUsersTable();
        const result = await database.query({
            text: `SELECT "userId", "passwordHash" FROM users WHERE "username" = $1;`,
            values: [username.trim()]
        });
        const user = result.rows[0];
        const validPassword = user && await bcrypt.compare(currentPassword, user.passwordHash);

        if (!validPassword) {
            return res.status(401).json({ error: 'รหัสผ่านเดิมไม่ถูกต้อง' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await database.query({
            text: `UPDATE users SET "passwordHash" = $1 WHERE "userId" = $2;`,
            values: [passwordHash, user.userId]
        });
        res.status(200).json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateProfile(req, res) {
    const { userId, username, email } = req.body;

    if (!userId || !username || !email) {
        return res.status(400).json({ error: 'กรุณากรอก username และ email' });
    }

    try {
        await ensureUsersTable();
        const result = await database.query({
            text: `UPDATE users
                   SET "username" = $1, "email" = $2
                   WHERE "userId" = $3
                   RETURNING "userId", "username", "email";`,
            values: [username.trim(), email.trim().toLowerCase(), userId]
        });

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'ไม่พบข้อมูลสมาชิก' });
        }

        res.status(200).json({ message: 'แก้ไขข้อมูลสำเร็จ', user: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Username หรือ email นี้ถูกใช้แล้ว' });
        }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
