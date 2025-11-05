const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    req.user = { id: "fake-user-id", name: "dev-user" };
  }
  next();
};

export default authMiddleware;
