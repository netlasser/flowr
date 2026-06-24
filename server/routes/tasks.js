import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db.js';
import { getAll, findById, create, toggle, move, remove } from '../models/task.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const tasks = await getAll(req.user.id);
    res.json(tasks);
  } catch (err) {
    console.warn('[DB Fallback] GET /tasks — returning empty array:', err.message);
    res.json([]);
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { title, description, zoneId, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const taskId = req.body.id || crypto.randomUUID();
    const newTask = await create(taskId, title, description, zoneId || null, req.user.id, dueDate || null);
    res.status(201).json(newTask);
  } catch (err) {
    console.warn('[DB Fallback] POST /tasks — returning local task:', err.message);
    res.status(201).json({
      id: req.body.id || crypto.randomUUID(),
      title,
      description: description || null,
      completed: false,
      zoneId: zoneId || null,
      userId: req.user.id,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
});

router.get('/unbatched', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM tasks WHERE user_id = $1 AND zone_id IS NULL ORDER BY created_at ASC',
      [req.user.id]
    );
    const tasks = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      completed: r.completed,
      zoneId: r.zone_id,
      userId: r.user_id,
      dueDate: r.due_date,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
    res.json(tasks);
  } catch (err) {
    console.warn('[DB Fallback] GET /tasks/unbatched — returning empty array:', err.message);
    res.json([]);
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await findById(req.params.id, req.user.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    console.warn('[DB Fallback] GET /tasks/:id — returning null:', err.message);
    res.status(404).json({ error: 'Task not found' });
  }
});

router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const updated = await toggle(req.params.id, req.user.id);
    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updated);
  } catch (err) {
    console.warn('[DB Fallback] PATCH /tasks/:id/toggle — returning local toggle:', err.message);
    res.json({ id: req.params.id });
  }
});

router.patch('/:id/move', authenticateToken, async (req, res) => {
  const { zoneId } = req.body;

  if (!zoneId) {
    return res.status(400).json({ error: 'zoneId is required' });
  }

  try {
    const updated = await move(req.params.id, zoneId, req.user.id);
    res.json(updated);
  } catch (err) {
    console.warn('[DB Fallback] PATCH /tasks/:id/move — returning local move:', err.message);
    res.json({ id: req.params.id, zoneId });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await remove(req.params.id, req.user.id);
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.warn('[DB Fallback] DELETE /tasks/:id — returning success:', err.message);
    res.json({ success: true, id: req.params.id });
  }
});

export default router;
