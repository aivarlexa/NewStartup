const { isHttpError } = require("http-errors");

function errorHandler(err, req, res, next) {
  console.error(err); // Log the error for debugging

  if (isHttpError(err)) {
    return res.status(err.status).json({ message: err.message });
  }

  // For non-http-errors, send a generic 500 response
  // to avoid leaking implementation details.
  res.status(500).json({ message: "Internal Server Error" });
}

module.exports = errorHandler;