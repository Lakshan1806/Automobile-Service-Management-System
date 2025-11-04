import { validationResult } from "express-validator";
import { error } from "../utils/response.js";

const validationMiddleware = (req, res, next) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    return error(res, "Validation failed", 422, results.array());
  }
  next();
};

export default validationMiddleware;
