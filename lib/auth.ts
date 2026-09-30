import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(payload: object) {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
    if (!JWT_SECRET) {
        return null;
    }

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.log(error);
        return null;
    }
}