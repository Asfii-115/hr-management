import { Request, Response } from 'express';
import db from '../config/knex';
import { createAttendanceSchema, updateAttendanceSchema } from '../validators/attendanceValidator';

interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  check_in_time: string;
}

interface CreateAttendanceBody {
  employee_id: number;
  date: string;
  check_in_time: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: { page: number; limit: number; total: number; totalPages: number };
}

class AttendanceController {
  public async getAll(req: Request, res: Response<ApiResponse<Attendance[]>>): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const { employee_id, date, from, to } = req.query;

      let query = db<Attendance>('attendance');
      let countQuery = db<Attendance>('attendance');

      if (employee_id) { query = query.where({ employee_id }); countQuery = countQuery.where({ employee_id }); }
      if (date) { query = query.where({ date }); countQuery = countQuery.where({ date }); }
      if (from) { query = query.where('date', '>=', from as string); countQuery = countQuery.where('date', '>=', from as string); }
      if (to) { query = query.where('date', '<=', to as string); countQuery = countQuery.where('date', '<=', to as string); }

      const [{ count }] = await countQuery.count<{ count: string }[]>('id as count');
      const records = await query.orderBy('date', 'desc').limit(limit).offset(offset);
      const total = parseInt(count);

      res.status(200).json({
        success: true,
        message: 'Attendance records retrieved.',
        data: records,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err) {
      console.error('Get all attendance error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }

  public async getById(req: Request<{ id: string }>, res: Response<ApiResponse<Attendance>>): Promise<void> {
    try {
      const record = await db<Attendance>('attendance').where({ id: req.params.id }).first();
      if (!record) {
        res.status(404).json({ success: false, message: 'Attendance record not found.' });
        return;
      }
      res.status(200).json({ success: true, message: 'Attendance record retrieved.', data: record });
    } catch (err) {
      console.error('Get attendance by ID error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }

  public async create(req: Request<object, ApiResponse<Attendance>, CreateAttendanceBody>, res: Response<ApiResponse<Attendance>>): Promise<void> {
    const { error, value } = createAttendanceSchema.validate(req.body);
    if (error) {
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }

    const { employee_id, date, check_in_time } = value as CreateAttendanceBody;

    try {
      const employee = await db('employees').where({ id: employee_id }).first();
      if (!employee) {
        res.status(404).json({ success: false, message: 'Employee not found.' });
        return;
      }

      const existing = await db<Attendance>('attendance').where({ employee_id, date }).first();
      if (existing) {
        const [updated] = await db<Attendance>('attendance').where({ employee_id, date }).update({ check_in_time }).returning('*');
        res.status(200).json({ success: true, message: 'Attendance updated (upsert).', data: updated });
        return;
      }

      const [record] = await db<Attendance>('attendance').insert({ employee_id, date, check_in_time }).returning('*');
      res.status(201).json({ success: true, message: 'Attendance recorded successfully.', data: record });
    } catch (err) {
      console.error('Create attendance error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }

  public async update(req: Request<{ id: string }>, res: Response<ApiResponse<Attendance>>): Promise<void> {
    const { error, value } = updateAttendanceSchema.validate(req.body);
    if (error) {
      res.status(400).json({ success: false, message: error.details[0].message });
      return;
    }

    try {
      const existing = await db<Attendance>('attendance').where({ id: req.params.id }).first();
      if (!existing) {
        res.status(404).json({ success: false, message: 'Attendance record not found.' });
        return;
      }
      const [updated] = await db<Attendance>('attendance').where({ id: req.params.id }).update(value).returning('*');
      res.status(200).json({ success: true, message: 'Attendance updated.', data: updated });
    } catch (err) {
      console.error('Update attendance error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }

  public async delete(req: Request<{ id: string }>, res: Response<ApiResponse<null>>): Promise<void> {
    try {
      const existing = await db<Attendance>('attendance').where({ id: req.params.id }).first();
      if (!existing) {
        res.status(404).json({ success: false, message: 'Attendance record not found.' });
        return;
      }
      await db<Attendance>('attendance').where({ id: req.params.id }).delete();
      res.status(200).json({ success: true, message: 'Attendance record deleted.', data: null });
    } catch (err) {
      console.error('Delete attendance error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }
}

export default new AttendanceController();