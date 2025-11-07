import jwt from "jsonwebtoken";

const TOKEN_COOKIE_NAME = "token";

if (!process.env.ACCESS_TOKEN_SECRET) {
  console.warn(
    "ACCESS_TOKEN_SECRET is not set. Falling back to an insecure development secret."
  );
}

const TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET ?? "dev-admin-secret";

function authenticateToken(req, res, next) {
  const token = req.cookies?.[TOKEN_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  jwt.verify(token, TOKEN_SECRET, (error, payload) => {
    if (error) {
      return res.status(401).json({ message: "Session verification failed." });
    }

    req.user = {
      ...payload,
      id: payload?.sub ?? payload?.id,
    };

    next();
  });
}

export default authenticateToken;
