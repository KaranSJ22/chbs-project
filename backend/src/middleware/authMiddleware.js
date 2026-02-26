const jwt = require('jsonwebtoken');

//Authentication middleware
const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({ error: 'Authentication required. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach verified identity to request
        req.user = {
            empCode: decoded.empCode,
            role: decoded.role
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Session expired. Please login again.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token. Access denied.' });
        }
        return res.status(500).json({ error: 'Authentication error.' });
    }
};

module.exports = authMiddleware;
