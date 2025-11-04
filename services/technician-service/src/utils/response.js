export const success = (
  res,
  data = null,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const error = (
  res,
  message = "Error",
  statusCode = 500,
  details = null
) => {
  return res.status(statusCode).json({ success: false, message, details });
};
