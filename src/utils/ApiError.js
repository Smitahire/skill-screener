class ApiError extends Error{
    constructor(
        statusCode,
        message = "something went wrong!!",
        error=[],
        stack=""
    ){
        super(message)
        this.statusCode = statusCode;
        this.message = message;
        this.data = null;
        this.errors = error;
        this.suscess = false;

        
        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}
