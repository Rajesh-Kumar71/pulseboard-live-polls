export function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || res.statusCode || 500;

  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong"
      : error.message || "Something went wrong";

  res.status(statusCode).json({
    ok: false,
    message,
  });
}