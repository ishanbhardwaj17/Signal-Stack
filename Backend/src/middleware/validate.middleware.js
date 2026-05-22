const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                errors: result.error.issues.map((err) => err.message),
            });
        }

        req.body = result.data;

        next();
    };
};

export default validate;