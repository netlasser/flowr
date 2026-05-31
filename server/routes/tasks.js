import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getAll, create, toggle, move, remove } from '../models/task.js';

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  try {
    const tasks = getAll(req.user.id);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', authenticateToken, (req, res) => {
  const { title, description, zoneId } = req.body;

  if (!title || !zoneId) {
    return res.status(400).json({ error: 'Title and zoneId are required' });
  }

  try {
    const taskId = `t-${Date.now()}`;
    const newTask = create(taskId, title, description, zoneId, req.user.id);
    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.patch('/:id/toggle', authenticateToken, (req, res) => {
  try {
    const updated = toggle(req.params.id, req.user.id);
    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});

router.patch('/:id/move', authenticateToken, (req, res) => {
  const { zoneId } = req.body;

  if (!zoneId) {
    return res.status(400).json({ error: 'zoneId is required' });
  }

  try {
    const updated = move(req.params.id, zoneId, req.user.id);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to move task' });
  }
});

router.delete('/:id', authenticateToken, (req, res) => {
  try {
    remove(req.params.id, req.user.id);
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
