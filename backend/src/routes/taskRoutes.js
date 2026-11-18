const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");

const router = express.Router();
const statuses = ["Pending", "In Progress", "Completed"];
const priorities = ["Low", "Medium", "High"];

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/tasks?status=Pending&priority=High&search=assignment
router.get("/", async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const filter = {};
    if (status && statuses.includes(status)) filter.status = status;
    if (priority && priorities.includes(priority)) filter.priority = priority;
    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { category: { $regex: safeSearch, $options: "i" } }
      ];
    }
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) { next(error); }
});

// GET /api/tasks/:id
router.get("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid task ID" });
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, data: task });
  } catch (error) { next(error); }
});

// POST /api/tasks
router.post("/", async (req, res, next) => {
  try {
    const { title, description, status, priority, category, dueDate } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Task title is required" });
    }
    const task = await Task.create({ title, description, status, priority, category, dueDate: dueDate || null });
    res.status(201).json({ success: true, message: "Task created successfully", data: task });
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: error.message });
    next(error);
  }
});

// PUT /api/tasks/:id
router.put("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid task ID" });
    const allowed = ["title", "description", "status", "priority", "category", "dueDate"];
    const updates = {};
    allowed.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = key === "dueDate" && !req.body[key] ? null : req.body[key];
    });
    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true, runValidators: true
    });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, message: "Task updated successfully", data: task });
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: error.message });
    next(error);
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid task ID" });
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) { next(error); }
});

module.exports = router;
