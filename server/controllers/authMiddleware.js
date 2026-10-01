import jwt from "jsonwebtoken";
import database from "../database.js";

// Routes that change data, or that return other members' details, must know who
// is calling. The answer comes from the signed token cookie, never from the body.
export async function requireLogin(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ error: 'auth.loginRequired' });
    }
    let payload;
    try {
        payload = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
        console.log(err.message);
        return res.status(401).json({ error: 'auth.loginRequired' });
    }

    try {
        const result = await database.query({
            text: `SELECT "memEmail", "memName", "dutyId" FROM "members" WHERE "memEmail" = $1;`,
            values: [payload.memEmail]
        });
        if (!result.rowCount) {
            return res.status(401).json({ error: 'auth.loginRequired' });
        }
        req.member = { ...payload, ...result.rows[0] };
        return next();
    } catch (err) {
        console.error(err);
        return res.status(503).json({ error: 'auth.roleCheckFail' });
    }
}

export function requireAdmin(req, res, next) {
    if (req.member?.dutyId !== 'admin') {
        return res.status(403).json({ error: 'auth.adminRequired' });
    }
    return next();
}
