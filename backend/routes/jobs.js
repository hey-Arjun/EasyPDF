const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Job = require('../models/Job');

// Get user's job history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 jobs

    res.status(200).json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: jobs
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving jobs'
    });
  }
});

// Get specific job by ID
router.get('/:jobId', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findOne({ 
      _id: req.params.jobId, 
      userId: req.user.id 
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job retrieved successfully',
      data: job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving job'
    });
  }
});

// Delete a job
router.delete('/:jobId', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ 
      _id: req.params.jobId, 
      userId: req.user.id 
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting job'
    });
  }
});

module.exports = router; 