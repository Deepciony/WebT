import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import path from "path";
import database from "../database.js";

// httpOnly keeps the token away from page JavaScript (XSS); strict stops cross-site sends.
const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
};

// The photo is named after the signed-in member, so strip anything that could walk the path
const reserved = /^(default|avatar-.*)$/i;
function photoStem(memEmail) {
    const stem = String(memEmail).replace(/[^A-Za-z0-9@._-]/g, '_');
    // never let a member claim default.jpg or one of the shipped avatars
    return reserved.test(stem) ? '_' + stem : stem;
}
const photoDir = 'img_mem';
const photoExt = (mimetype) => (mimetype === 'image/png' ? 'png' : mimetype === 'image/webp' ? 'webp' : 'jpg');

// the photo keeps its real extension, so look the file up by its stem
function findPhoto(memEmail) {
    const stem = photoStem(memEmail);
    const found = fs.readdirSync(photoDir).find((name) => path.parse(name).name === stem);
    return found ? `/${photoDir}/${found}` : null;
}

// a fresh clone may not have the folder yet, and multer will not create it
fs.mkdirSync("img_mem", { recursive: true });

const photoUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, callback) => callback(null, 'img_mem'),
        // the owner comes from the token, never from the form body
        filename: (req, file, callback) => callback(null, `${photoStem(req.member.memEmail)}.${photoExt(file.mimetype)}`)
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype));
    }
}).single('file');

// requireLogin runs first, so req.member is already the verified token
export async function uploadMemberPhoto(req, res) {
    console.log(`POST /members/uploadimg is requested.`);
    photoUpload(req, res, (err) => {
        if (err) {
            console.log(err.message);
            return res.status(400).json({ error: 'photo.uploadFail' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'photo.invalid' });
        }
        // a member has one photo: drop the copies left over in other formats
        const stem = photoStem(req.member.memEmail);
        for (const name of fs.readdirSync(photoDir)) {
            if (path.parse(name).name === stem && name !== req.file.filename) {
                fs.unlinkSync(path.join(photoDir, name));
            }
        }
        return res.json({ message: 'photo.uploaded', photo: `/${photoDir}/${req.file.filename}` });
    });
}

export async function deleteMemberPhoto(req, res) {
    console.log(`DELETE /members/photo is requested.`);
    try {
        const stem = photoStem(req.member.memEmail);
        let removed = false;
        for (const name of fs.readdirSync(photoDir)) {
            if (path.parse(name).name === stem) {
                fs.unlinkSync(path.join(photoDir, name));
                removed = true;
            }
        }
        if (!removed) return res.status(404).json({ error: 'photo.none' });
        return res.json({ message: 'photo.removed', photo: null });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'photo.removeFail' });
    }
}

export async function postMember(req, res) {
    console.log(`POST /members is requested.`);
    const bodyData = req.body;
    try {
        // Stored trimmed and lower case so "A@b.com" and "a@b.com" are one account
        const memEmail = String(bodyData.memEmail || '').trim().toLowerCase();
        const memName = String(bodyData.memName || '').trim();
        const password = String(bodyData.password || '');

        if (!memEmail || !memName || !password) {
            return res.json({ message: `ERROR memEmail, memName and password are required.`, regist: false });
        }
        if (password.length < 6) {
            return res.json({ message: `ERROR password must be at least 6 characters.`, regist: false });
        }
        if (memEmail.length > 100 || memName.length > 100) {
            return res.json({ message: `ERROR memEmail and memName must be 100 characters or less.`, regist: false });
        }
        const chkRow = await database.query({
            text: `SELECT * FROM members WHERE LOWER("memEmail") = $1`,
            values: [memEmail]
        });
        if (chkRow.rowCount != 0) {
            return res.json({ message: `ERROR memEmail ${memEmail} is exists.`, regist: false });
        }

        // Store only the bcrypt hash, never the password itself
        const saltround = 11;
        const pwdHash = await bcrypt.hash(password, saltround);
        await database.query({
             text: `INSERT INTO "members" ("memEmail", "memName", "memHash")
                 VALUES ($1, $2, $3)`,
             values: [memEmail, memName, pwdHash]
        });
        // Echo back only public fields, not the password
        res.json({
            memEmail,
            memName,
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
        const loginName = String(bodyData.loginName || '').trim().toLowerCase();
        if (!loginName || !bodyData.password) {
            return res.json({ message: `Login and Password is required`, login: false });
        }
        const result = await database.query({
            text: `SELECT * FROM members WHERE LOWER("memEmail") = $1`,
            values: [loginName]
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

export async function devAdminLogin(req, res) {
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DEV_ADMIN_BYPASS !== 'true') {
        return res.status(404).json({ error: 'auth.devAdminDisabled' });
    }
    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
    if (!process.env.DEV_ADMIN_PASSCODE || passcode !== process.env.DEV_ADMIN_PASSCODE.trim()) {
        return res.status(401).json({ error: 'auth.devAdminPasscodeInvalid' });
    }
    const adminEmail = String(process.env.DEV_ADMIN_EMAIL || '').trim().toLowerCase();
    if (!adminEmail) {
        return res.status(503).json({ error: 'auth.devAdminAccountUnavailable' });
    }
    try {
        const result = await database.query({
            text: `SELECT "memEmail", "memName", "dutyId" FROM "members" WHERE LOWER("memEmail") = $1;`,
            values: [adminEmail]
        });
        const admin = result.rows[0];
        if (!admin || admin.dutyId !== 'admin') {
            return res.status(403).json({ error: 'auth.devAdminAccountUnavailable' });
        }
        const token = jwt.sign(admin, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', token, { ...cookieOptions, maxAge: 3600000 });
        return res.json({ login: true });
    } catch (err) {
        console.error(err);
        return res.status(503).json({ error: 'auth.roleCheckFail' });
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
        const result = await database.query({
            text: `SELECT "memEmail", "memName", "dutyId" FROM "members" WHERE "memEmail" = $1;`,
            values: [member.memEmail]
        });
        if (!result.rowCount) return res.json({ message: `No member`, login: false });
        const currentMember = result.rows[0];
        return res.json({
            ...currentMember,
            photo: findPhoto(currentMember.memEmail),
            login: true
        });
    }
    catch (err) {
        console.log(err.message);
        return res.json({ message: `The information was falsified.`, login: false });
    }
}

export async function updateMember(req, res) {
    // requireLogin already verified the token cookie and filled req.member

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
        const member = req.member;
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
            photo: findPhoto(member.memEmail),
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
