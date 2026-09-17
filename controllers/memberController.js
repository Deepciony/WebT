import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import database from "../database.js";

// httpOnly keeps the token away from page JavaScript (XSS); strict stops cross-site sends.
const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
};

export async function postMember(req, res) {
    console.log(`POST /members is requested.`);
    const bodyData = req.body;
    try {
        if (!bodyData.memEmail || !bodyData.memName || !bodyData.password) {
            return res.json({ message: `ERROR memEmail, memName and password are required.`, regist: false });
        }
        const chkRow = await database.query({
            text: `SELECT * FROM members WHERE "memEmail" = $1`,
            values: [bodyData.memEmail]
        });
        if (chkRow.rowCount != 0) {
            return res.json({ message: `ERROR memEmail ${bodyData.memEmail} is exists.`, regist: false });
        }

        // Store only the bcrypt hash, never the password itself
        const saltround = 11;
        const pwdHash = await bcrypt.hash(bodyData.password, saltround);
        await database.query({
            text: `INSERT INTO "members" ("memEmail", "memName", "memHash")
                   VALUES ($1, $2, $3)`,
            values: [bodyData.memEmail, bodyData.memName, pwdHash]
        });
        // Echo back only public fields, not the password
        res.json({
            memEmail: bodyData.memEmail,
            memName: bodyData.memName,
            createDate: new Date(),
            message: "Regist Success",
            regist: true
        });
    }
    catch (err) {
        return res.json({ message: err.message || `Server error`, regist: false });
    }
}

export async function loginMember(req, res) {
    console.log(`POST /members/login is requested.`);
    const bodyData = req.body;
    try {
        if (!bodyData.loginName || !bodyData.password) {
            return res.json({ message: `Login and Password is required`, login: false });
        }
        const result = await database.query({
            text: `SELECT * FROM members WHERE "memEmail" = $1`,
            values: [bodyData.loginName]
        });
        if (result.rowCount == 0) {
            return res.json({ message: `Login Fail`, login: false });
        }

        const loginOK = await bcrypt.compare(bodyData.password, result.rows[0].memHash);
        if (loginOK) {
            // Token payload: identifying but not secret
            const theuser = {
                memEmail: result.rows[0].memEmail,
                memName: result.rows[0].memName,
                dutyId: result.rows[0].dutyId
            };
            const token = jwt.sign(theuser, process.env.SECRET_KEY, { expiresIn: '1h' });
            res.cookie('token', token, { ...cookieOptions, maxAge: 3600000 });
            res.json({ message: `Login Success`, login: true });
        }
        else {
            res.clearCookie('token', cookieOptions);
            res.json({ message: `Login Fail`, login: false });
        }
    }
    catch (err) {
        return res.json({ message: err.message || `Server error`, login: false });
    }
}

export async function getMember(req, res) {
    console.log(`GET /members/detail is requested.`);
    const token = req.cookies.token;
    if (!token)
        return res.json({ message: `No member`, login: false });
    try {
        // verify fails if the token or its signature was tampered with
        const member = jwt.verify(token, process.env.SECRET_KEY);
        return res.json({
            memEmail: member.memEmail,
            memName: member.memName,
            dutyId: member.dutyId,
            login: true
        });
    }
    catch (err) {
        console.log(err.message);
        return res.json({ message: `The information was falsified.`, login: false });
    }
}

export async function updateMember(req, res) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: 'profile.notAuthenticated' });
    }

    const { memName, currentPassword, newPassword, confirmPassword } = req.body;
    const nextName = typeof memName === 'string' ? memName.trim() : '';

    if (!nextName) {
        return res.status(400).json({ error: 'profile.nameRequired' });
    }
    if (nextName.length > 100) {
        return res.status(400).json({ error: 'profile.nameTooLong' });
    }
    if (newPassword || currentPassword || confirmPassword) {
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ error: 'profile.passwordFieldsRequired' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'profile.passwordTooShort' });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'profile.passwordMismatch' });
        }
    }

    try {
        const member = jwt.verify(token, process.env.SECRET_KEY);
        const result = await database.query({
            text: `SELECT "memEmail", "memHash", "dutyId"
                   FROM "members" WHERE "memEmail" = $1;`,
            values: [member.memEmail]
        });
        const currentMember = result.rows[0];

        if (!currentMember) {
            return res.status(404).json({ error: 'profile.notFound' });
        }
        if (newPassword && !(await bcrypt.compare(currentPassword, currentMember.memHash))) {
            return res.status(401).json({ error: 'profile.currentPasswordWrong' });
        }

        const nextHash = newPassword
            ? await bcrypt.hash(newPassword, 11)
            : currentMember.memHash;
        await database.query({
            text: `UPDATE "members"
                   SET "memName" = $1, "memHash" = $2
                   WHERE "memEmail" = $3;`,
            values: [nextName, nextHash, member.memEmail]
        });

        const nextToken = jwt.sign({
            memEmail: member.memEmail,
            memName: nextName,
            dutyId: currentMember.dutyId
        }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', nextToken, { ...cookieOptions, maxAge: 3600000 });
        return res.json({
            memEmail: member.memEmail,
            memName: nextName,
            dutyId: currentMember.dutyId,
            login: true
        });
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'profile.notAuthenticated' });
        }
        console.error(err);
        return res.status(500).json({ error: 'profile.updateFail' });
    }
}

export async function logoutMember(req, res) {
    console.log(`GET /members/logout is requested.`);
    try {
        res.clearCookie('token', cookieOptions);
        res.json({ message: `Logout Success`, login: false });
    }
    catch (err) {
        return res.json({ message: err.message });
    }
}
