import { check, validationResult } from 'express-validator';

export const validateDepartment = [
    check('name')
        .optional()
        .matches(/^[A-Za-z\s-]+$/)
        .withMessage('Invalid name. It must contain only alphabets, spaces, and hyphens.'),
    check('locationID')
        .optional()
        .isUUID()
        .withMessage('Invalid locationID. It must be a valid UUID.'),
    check('HodId')
        .optional()
        .isNumeric()
        .withMessage('Invalid HodId. It must be a valid number.'),
    check('budget')
        .optional()
        .matches(/^\d+(\.\d{1,2})?$/)
        .withMessage('Invalid budget amount. It must be a number with up to 2 decimal places.'),
    check('description')
        .optional()
        .matches(/^[A-Za-z\s-]+$/)
        .withMessage('Invalid name. It must contain only alphabets, spaces, and hyphens.'),

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
