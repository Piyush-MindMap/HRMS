import { check, validationResult } from 'express-validator';
import prisma from '../../config/db.config.js';

export const validateJobTitle = [
    check('JobTitle')
        .optional()
        .matches(/^[A-Za-z\s-]+$/)
        .withMessage('Invalid name. It must contain only alphabets, spaces, and hyphens.'),
    check('DepartmentID')
        .optional()
        .isUUID()
        .custom(async (value) => {
            const department = await prisma.departments.findUnique({
                where: { DepartmentID: value },
            });
            if (!department) {
                return Promise.reject('Invalid DepartmentID. It does not exist.');
            }
        })
        .withMessage('Invalid DepartmentID. It must be a valid UUID.'),
    check('Responsibilities')
        .optional()
        .matches(/^[A-Za-z\s-]+$/)
        .withMessage('Invalid name. It must contain only alphabets, spaces, and hyphens.'),
    check('MinSalary')
        .optional()
        .matches(/^\d+(\.\d{1,2})?$/)
        .withMessage('Invalid budget amount. It must be a number with up to 2 decimal places.'),
    check('MaxSalary')
        .optional()
        .matches(/^\d+(\.\d{1,2})?$/)
        .withMessage('Invalid budget amount. It must be a number with up to 2 decimal places.'),
    check('Description')
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
