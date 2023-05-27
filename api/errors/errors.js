class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

class UnauthorizedError extends Error {
  constructor(message, errorCode) {
    super(message);
    this.statusCode = 401;
    this.errorCode = errorCode;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
  }
}

class InternalServerError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 500;
  }
}

class ServiceUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 503;
  }
}

module.exports = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  NotFoundError,
  InternalServerError,
  ServiceUnavailableError,
};
