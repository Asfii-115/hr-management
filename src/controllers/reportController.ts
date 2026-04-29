import { Request, Response } from 'express';
import db from '../config/knex';

interface AttendanceSummary {
  employee_id: number;
  name: string;
  days_present: number;
  times_late: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: { month: string; employee_id?: number };
}

class ReportController {
  public async monthlyAttendance(req: Request, res: Response<ApiResponse<AttendanceSummary[]>>): Promise<void> {
    const { month, employee_id } = req.query;

    if (!month || !/^\d{4}-\d{2}$/.test(month as string)) {
      res.status(400).json({
        success: false,
        message: 'Query parameter "month" is required in YYYY-MM format (e.g., 2025-08).',
      });
      return;
    }

    const [year, mon] = (month as string).split('-').map(Number);
    const startDate = `${year}-${String(mon).padStart(2, '0')}-01`;
    const endDate = new Date(year, mon, 0).toISOString().split('T')[0];

    try {
      let query = db('attendance as a')
        .join('employees as e', 'a.employee_id', 'e.id')
        .whereBetween('a.date', [startDate, endDate])
        .select(
          'a.employee_id',
          'e.name',
          db.raw('COUNT(a.id) as days_present'),
          db.raw(`SUM(CASE WHEN a.check_in_time > '09:45:00' THEN 1 ELSE 0 END) as times_late`),
        )
        .groupBy('a.employee_id', 'e.name')
        .orderBy('e.name');

      if (employee_id) {
        query = query.where('a.employee_id', employee_id as string);
      }

      const results = await query;
      const formatted: AttendanceSummary[] = results.map((row) => ({
        employee_id: Number(row.employee_id),
        name: row.name as string,
        days_present: Number(row.days_present),
        times_late: Number(row.times_late),
      }));

      res.status(200).json({
        success: true,
        message: 'Monthly attendance report generated.',
        data: formatted,
        meta: { month: month as string, ...(employee_id ? { employee_id: Number(employee_id) } : {}) },
      });
    } catch (err) {
      console.error('Monthly report error:', err);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  }
}

export default new ReportController();