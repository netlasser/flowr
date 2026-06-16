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
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { title, description, zoneId } = req.body;

  if (!title || !zoneId) {
    return res.status(400).json({ error: 'Title and zoneId are required' });
  }

  try {
    const taskId = req.body.id || `t-${Date.now()}`;
    const newTask = await create(taskId, title, description, zoneId, req.user.id);
    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.get('/unbatched', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM tasks WHERE user_id = $1 AND (zone_id IS NULL OR zone_id = '')`,
      [req.user.id]
    );
    const tasks = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      completed: r.completed,
      zoneId: r.zone_id,
      userId: r.user_id,
      createdAt: r.created_at,
      completedAt: r.completed_at,
    }));
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch unbatched tasks' });
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
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch task' });
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
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle task' });
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
    console.error(err);
    res.status(500).json({ error: 'Failed to move task' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await remove(req.params.id, req.user.id);
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
