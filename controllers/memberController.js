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
