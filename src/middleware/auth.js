import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET; 

// Middleware לבדיקת טוקן
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // תומך ב"Bearer <token>"

  if (!token) return res.sendStatus(401); // אין טוקן בכלל

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // טוקן לא תקף
    req.user = user; // שמור את הנתונים ב־req.user
    next();
  });
}

// פונקציה ליצירת טוקן
export function generateToken(user) {
  return jwt.sign({ email: user.email, role: user.role || 'user' }, SECRET, {
    expiresIn: '12h'
  });
}
