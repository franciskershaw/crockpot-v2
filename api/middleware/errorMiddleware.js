const { UnauthorizedError } = require('../errors/errors');
const moment = require('moment')

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(moment().format('MMMM Do YYYY, h:mm:ss a'), err);
  }

  const statusCode = err.statusCode || 500;
  let message = err.message;

  if (statusCode === 500) {
    message = 'An unexpected error occurred, please try again later.';
  }
  res.status(statusCode);

  if (err instanceof UnauthorizedError) {
    res.status(statusCode).json({
      message: message,
      errorCode: err.errorCode,
    });
  } else {
    res.status(statusCode).json({
      message: message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }
};

module.exports = {
  errorHandler,
};
