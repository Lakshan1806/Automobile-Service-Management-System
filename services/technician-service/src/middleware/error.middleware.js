import logger from "../utils/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message || err);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Server error" });
};
