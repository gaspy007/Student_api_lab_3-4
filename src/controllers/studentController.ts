import { Request, Response } from 'express';
import { pool } from '../db.ts';

export async function getStudents(_req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(
      'SELECT * FROM students ORDER BY id;'
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ message: 'Could not load students' });
  }
}


export async function updateStudent(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { student_number, first_name, last_name, course, year_level } = req.body;

    const result = await pool.query(
      `UPDATE students
       SET student_number = $1,
           first_name = $2,
           last_name = $3,
           course = $4,
           year_level = $5
       WHERE id = $6
       RETURNING *;`,
      [student_number, first_name, last_name, course, year_level, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: 'Could not update student' });
  }
}
