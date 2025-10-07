const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../errors.log');

const logError = (message, error = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}${error ? ': ' + error.message : ''}\n`;
  fs.appendFileSync(logFilePath, logEntry, 'utf8');
  console.error(logEntry);
};

const sendErrorResponse = (res, statusCode, message, details = null) => {
  const errorObj = { error: message };
  if (details) errorObj.details = details;
  res.status(statusCode).json(errorObj);
};

const handleGlobalError = (err, req, res, next) => {
  logError('Global error handler', err);
  if (res.headersSent) {
    return next(err);
  }
  sendErrorResponse(res, 500, 'Error interno del servidor', err.message);
};

module.exports = { logError, sendErrorResponse, handleGlobalError };