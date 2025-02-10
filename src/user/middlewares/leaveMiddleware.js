
import { check, validationResult } from 'express-validator';

export const validateLeaveRequest = [
    check('LeaveType')
        .optional()
        .isString()
        .custom((value) => {
            const validLeaveTypes = ['Earned', 'LOP'];
            if (!validLeaveTypes.includes(value)) {
                throw new Error('Invalid. It must be a valid Leave type.');
            }
            return true;
        })
        .withMessage('Invalid. It must be a valid Leave type.'),
    
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