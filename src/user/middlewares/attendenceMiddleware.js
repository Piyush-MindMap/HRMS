
import { check, validationResult } from 'express-validator';

export const validatCheckin = [
    check('time')
        .optional()
        .isTime()
        .withMessage('Invalid. It must be a valid Time.'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status_code: 400,
                errors: errors.array(),
            });
        }
        next();
    },
];