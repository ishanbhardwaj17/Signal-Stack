const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = err.message;
    }

    // Zod validation error
    if (err.name === "ZodError" && Array.isArray(err.errors)) {
        statusCode = 400;
        message = err.errors.map((e) => e.message).join(", ");
    }

    const response = {
        success: false,
        message,
    };

    // Include stack trace in non-production for easier debugging
    if (process.env.NODE_ENV !== "production") {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

export default errorMiddleware;