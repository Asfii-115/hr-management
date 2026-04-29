import Joi from 'joi';

export const createEmployeeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Employee name is required.',
    'string.min': 'Name must be at least 2 characters.',
  }),
  age: Joi.number().integer().min(18).max(100).required().messages({
    'any.required': 'Age is required.',
    'number.min': 'Age must be at least 18.',
  }),
  designation: Joi.string().trim().min(2).max(100).required().messages({
    'any.required': 'Designation is required.',
  }),
  hiring_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'any.required': 'Hiring date is required.',
      'string.pattern.base': 'Hiring date must be in YYYY-MM-DD format.',
    }),
  date_of_birth: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'any.required': 'Date of birth is required.',
      'string.pattern.base': 'Date of birth must be in YYYY-MM-DD format.',
    }),
  salary: Joi.number().positive().precision(2).required().messages({
    'any.required': 'Salary is required.',
    'number.positive': 'Salary must be a positive number.',
  }),
});

export const updateEmployeeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  age: Joi.number().integer().min(18).max(100),
  designation: Joi.string().trim().min(2).max(100),
  hiring_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  date_of_birth: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  salary: Joi.number().positive().precision(2),
}).min(1);