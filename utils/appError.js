class AppError extends Error {

    constructor(message, statusCode, status) {
        super(message);
        this.statusCode = statusCode;
        this.status = status;
        
        this.isOperational = true // for operational error 
    }
}

module.exports = AppError