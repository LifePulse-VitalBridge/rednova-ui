export const protectAdmin = (req, res, next) => {
  const token = req.headers.authorization;

  // Simple Badge Check (Matches the logic we built in Login)
  if (token && token.startsWith('REDNOVA-COMMAND-ACCESS')) {
    next(); // Access Granted
  } else {
    res.status(401).json({ message: "UNAUTHORIZED: COMMAND ACCESS REQUIRED" });
  }
};