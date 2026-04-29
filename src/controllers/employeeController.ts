import { Request, Response } from 'express';
import fs from 'fs';
import db from '../config/knex';
import { createEmployeeSchema, updateEmployeeSchema } from '../validators/employeeValidator';

interface Employee {
  id: number;
  name: string;
  age: number;
  designation: string;
  hiring_date: string;
  date_of_birth: string;
  salary: number;
  photo_path: string | null;
  created_at: Date;
  updated_at: Date;
}

interface CreateEmployeeBody {
  name: string;
  age: number;
  designation: string;
  hiring_date: string;
  date_of_birth: string;
  salary: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

class EmployeeController {
  public async getAll(req: Request, res: Response<ApiResponse<Employee[]>>): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;
      const offset = (page - 1) * limit;

      let query = db<Employee>('employees');
      let countQuery = db<Employee>('employees');

      if (search) {
        query = query.whereILike('name', `%${search}%`);
        countQuery = countQuery.whereILike('name', `%${search}%`);
      }

      const [{ count }] = await countQuery.count<{ count: string }[]>('id as count');
      const employees = await query.orderBy('created_at', 'desc').limit(limit).offset(offset);
      const total = parseInt(count);

      res.status(200).json({
        success: true,
        message: 'Employees retrieved successfully.',
        data: employees,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err) {
      console.error('Get all employees error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }

  public async getById(req: Request<{ id: string }>, res: Response<ApiResponse<Employee>>): Promise<void> {
    try {
      const employee = await db<Employee>('employees').where({ id: req.params.id }).first();
      if (!employee) {
        res.status(404).json({ success: false, message: 'Employee not found.' });
        return;
      }
      res.status(200).json({ success: true, message: 'Employee retrieved.', data: employee });
    } catch (err) {
      console.error('Get employee by ID error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }

  public async create(req: Request<object, ApiResponse<Employee>, CreateEmployeeBody>, res: Response<ApiResponse<Employee>>): Promise<void> {
    const { error, value } = createEmployeeSchema.validate(req.body);
    if (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }

    try {
      const photo_path = req.file ? req.file.path : null;
      const [employee] = await db<Employee>('employees')
        .insert({ ...value, photo_path, created_at: new Date(), updated_at: new Date() })
        .returning('*');
      res.status(201).json({ success: true, message: 'Employee created successfully.', data: employee });
    } catch (err) {
      if (req.file) fs.unlinkSync(req.file.path);
      console.error('Create employee error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }

  public async update(req: Request<{ id: string }>, res: Response<ApiResponse<Employee>>): Promise<void> {
    const { error, value } = updateEmployeeSchema.validate(req.body);
    if (error) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }

    try {
      const existing = await db<Employee>('employees').where({ id: req.params.id }).first();
      if (!existing) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(404).json({ success: false, message: 'Employee not found.' });
        return;
      }

      const updateData: Partial<Employee> = { ...value, updated_at: new Date() };
      if (req.file) {
        if (existing.photo_path && fs.existsSync(existing.photo_path)) {
          fs.unlinkSync(existing.photo_path);
        }
        updateData.photo_path = req.file.path;
      }

      const [updated] = await db<Employee>('employees')
        .where({ id: req.params.id })
        .update(updateData)
        .returning('*');

      res.status(200).json({ success: true, message: 'Employee updated successfully.', data: updated });
    } catch (err) {
      if (req.file) fs.unlinkSync(req.file.path);
      console.error('Update employee error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }

  public async delete(req: Request<{ id: string }>, res: Response<ApiResponse<null>>): Promise<void> {
    try {
      const existing = await db<Employee>('employees').where({ id: req.params.id }).first();
      if (!existing) {
        res.status(404).json({ success: false, message: 'Employee not found.' });
        return;
      }
      if (existing.photo_path && fs.existsSync(existing.photo_path)) {
        fs.unlinkSync(existing.photo_path);
      }
      await db('attendance').where({ employee_id: req.params.id }).delete();
      await db<Employee>('employees').where({ id: req.params.id }).delete();
      res.status(200).json({ success: true, message: 'Employee deleted successfully.', data: null });
    } catch (err) {
      console.error('Delete employee error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }
}

export default new EmployeeController();