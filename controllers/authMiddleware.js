import jwt from "jsonwebtoken";

// Routes that change data, or that return other members' details, must know who
// is calling. The answer comes from the signed token cookie, never from the body.
export function requireLogin(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ error: 'auth.loginRequired' });
    }
    try {
        req.member = jwt.verify(token, process.env.SECRET_KEY);
        return next();
    } catch (err) {
        console.log(err.message);
        return res.status(401).json({ error: 'auth.loginRequired' });
    }
}
