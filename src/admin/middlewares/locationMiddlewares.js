import { check, validationResult } from 'express-validator';

export const validateLocation = [
  check('contactNumber')
    .optional()
    .matches(/^\d{10}$/)
    .withMessage('contactNumber: Please provide a valid contact number.'),
  check('name')
    .optional()
    .matches(/^[A-Za-z0-9\s\/-]+$/)
    .withMessage('name: Location name must contain only alphabets, numbers, spaces, slashes, and hyphens.'),
  check('address')
    .optional()
    .matches(/^[A-Za-z0-9\s\/-]+$/)
    .withMessage('address: Address must contain only alphabets, numbers, spaces, slashes, and hyphens.'),
  check('city')
    .optional()
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('city: City must contain only alphabets and spaces.'),
  check('state')
    .optional()
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('state: State must contain only alphabets and spaces.'),
  check('country')
    .optional()
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('country: Country must contain only alphabets and spaces.'),
  check('timeZone')
    .optional()
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('timeZone: Time zone must contain only alphabets and spaces.'),


  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status_code: 400,
        message: errors.array().map(err => (
           err.msg
        )).toString(),
      });
    }
    next();
  },
];
