import express, { type Request, type Response } from 'express';
import 'dotenv/config';
import { pool } from './db.js';

const app = express();
const PORT = 4000;

app.use(express.json());

pool.query('SELECT NOW()')
  .then(() => console.log('Database connected successfully'))
  .catch(() => console.error('Database connection failed. Check .env, Supabase, and your network.'));
  
app.get('/students', async (req, res) => {
    try {
        const course = typeof req.query.course === 'string' && req.query.course.trim() !== '' 
            ? req.query.course 
            : null;

        let query = 'SELECT * FROM students';
        const values: string[] = [];

        if (course) {
            query += ' WHERE course = $1';
            values.push(course);
        }

        const result = await pool.query(query, values);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export async function getStudentById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ message: 'Student ID must be a positive integer' });
    return;
  }
 
  try {
    const result = await pool.query('SELECT * FROM students WHERE id = $1;', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: 'Could not load student' });
  }
}

app.get('/students/:id', getStudentById);


app.put('/students/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({ message: 'Invalid student ID' });
        return;
    }

    const { student_number, first_name, last_name, course, year_level } = req.body;

    if (!student_number || !first_name || !last_name || !course || !year_level) {
        res.status(400).json({ message: 'All student fields are required' });
        return;
    }

    try {
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

        res.status(200).json({
            message: 'Student updated successfully',
            student: result.rows[0]
        });

    } catch (err) {
        console.error('Error updating student:', err);
        res.status(500).json({ message: 'Could not update student' });
    }
});


app.delete('/students/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({ message: 'Invalid student ID' });
        return;
    }

    try {
        const result = await pool.query(
            'DELETE FROM students WHERE id = $1 RETURNING *;',
            [id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }

        res.status(200).json({
            message: 'Student deleted successfully',
            student: result.rows[0]
        });

    } catch (err) {
        console.error('Error deleting student:', err);
        res.status(500).json({ message: 'Could not delete student' });
    }
});


app.post('/students', async (req, res) => {
    const { student_number, first_name, last_name, course, year_level } = req.body;

    if (!student_number || !first_name || !last_name || !course || !year_level) {
        res.status(400).json({ message: 'All student fields are required' });
        return;
    }

    try {
        const result = await pool.query(
            `INSERT INTO students
             (student_number, first_name, last_name, course, year_level)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *;`,
            [student_number, first_name, last_name, course, year_level]
        );

        res.status(201).json({
            message: 'Student created successfully',
            student: result.rows[0]
        });

    } catch (err) {
        console.error('Error creating student:', err);
        res.status(500).json({ message: 'Could not create student' });
    }
});



app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});