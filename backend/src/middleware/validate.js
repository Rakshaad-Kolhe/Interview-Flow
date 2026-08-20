"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (e) {
            if (e instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: e.errors,
                });
            }
            return res.status(400).json({ success: false, message: 'Invalid request' });
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map