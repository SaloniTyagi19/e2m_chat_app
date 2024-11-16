class appError extends Error {
    statusCode;
    isOperational;
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        stack ? this.stack = stack : Error.captureStackTrace(this, this.constructor)
    }
}

export default appError