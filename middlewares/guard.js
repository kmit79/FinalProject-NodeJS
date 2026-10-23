import jwt from 'jsonwebtoken';

export const authGuard = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers['x-auth-token'];
    if (!authHeader) {
        return res.status(401).send({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).send({ message: 'Invalid or expired token.' });
    }
};

export const adminGuard = (req, res, next) => {
    authGuard(req, res, () => {
        if (req.user && req.user.isAdmin) {
            next();
        } else {
            return res.status(403).send({ message: 'Access denied. Admin authorization required.' });
        }
    });
};

export const businessGuard = (req, res, next) => {
    authGuard(req, res, () => {
        if (req.user && (req.user.isBusiness || req.user.isAdmin)) {
            next();
        } else {
            return res.status(403).send({ message: 'Access denied. Business account required.' });
        }
    });
};

