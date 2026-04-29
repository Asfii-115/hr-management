import Joi from 'joi';

export const createAttendanceSchema = Joi.object({
  employee_id: Joi.number().integer().positive().required().messages({
    'any.required': 'employee_id is required.',
    'number.positive': 'employee_id must be a positive integer.',
  }),
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'any.required': 'Date is required.',
      'string.pattern.base': 'Date must be in YYYY-MM-DD format.',
    }),
  check_in_time: Joi.string()
    .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
    .required()
    .messages({
      'any.required': 'check_in_time is required.',
      'string.pattern.base': 'check_in_time must be in HH:MM or HH:MM:SS format.',
    }),
});

export const updateAttendanceSchema = Joi.object({
  employee_id: Joi.number().integer().positive(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  check_in_time: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/),
}).min(1);