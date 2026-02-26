const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { callSP } = require('../queries/spWrapper');
const SP = require('../../property/procedures');

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 60 * 1000, // 1
    path: '/'
};

//  helper function 
const signAndSend = (res, empCode, role, name) => {
    const token = jwt.sign(
        { empCode, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1/2h' }
    );
    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(200).json({
        message: 'Login successful',
        user: { empCode, role, name }
    });
};

// Employee / Admin Login
exports.login = async (req, res) => {
    try {
        const { empCode, password } = req.body;

        if (!empCode || !password) {
            return res.status(400).json({ error: 'Employee code and password are required.' });
        }
        if (empCode.length > 7) {
            return res.status(400).json({ error: 'Invalid employee code format.' });
        }

        const result = await callSP(SP.USER_LOGIN, { p_Code: empCode });
        const rows = Array.isArray(result[0]) ? result[0] : result;
        const user = rows[0];

        if (!user) return res.status(401).json({ error: 'Invalid credentials.' });

        const isMatch = await bcrypt.compare(password, user.PASSWRD);
        delete user.PASSWRD;
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });

        signAndSend(res, user.EMPLOYEECODE, user.ROLEID, user.EMPLOYEENAME);
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

//PA Login
exports.loginPA = async (req, res) => {
    try {
        const { empCode, password } = req.body;

        if (!empCode || !password) {
            return res.status(400).json({ error: 'PA code and password are required.' });
        }
        if (empCode.length > 7) {
            return res.status(400).json({ error: 'Invalid PA code format.' });
        }

        const result = await callSP(SP.PA_LOGIN, { p_Code: empCode });
        const rows = Array.isArray(result[0]) ? result[0] : result;
        const pa = rows[0];

        if (!pa) return res.status(401).json({ error: 'Invalid credentials.' });

        const isMatch = await bcrypt.compare(password, pa.PASSWRD);
        delete pa.PASSWRD;
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });

        signAndSend(res, pa.PA_EMPCODE, 'PA', pa.PA_NAME);
    } catch (error) {
        console.error('PA Login Error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// ── Logout ────────────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
    res.status(200).json({ message: 'Logged out successfully.' });
};

// ── Session Check ─────────────────────────────────────────────────────────────
exports.getMe = (req, res) => {
    res.status(200).json({
        user: {
            empCode: req.user.empCode,
            role: req.user.role,
            name: req.user.name || null
        }
    });
};
