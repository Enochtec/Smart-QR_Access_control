const express = require('express')
const router = express.Router()
const pool = require('../db')

// record entry or exit based on qr token
router.post('/scan', async (req, res) => {
  try {
    const { qrToken, action } = req.body // action should be 'entry' or 'exit'
    if (!qrToken || !['entry', 'exit'].includes(action)) {
      return res.status(400).json({ message: 'Invalid scan payload' })
    }

    // find user
    const [users] = await pool.execute('SELECT id FROM users WHERE qr_token = ?', [qrToken])
    if (users.length === 0) {
      return res.status(404).json({ message: 'QR code not recognized' })
    }
    const userId = users[0].id

    await pool.execute('INSERT INTO logs (user_id, action) VALUES (?, ?)', [userId, action])
    res.json({ message: 'Logged successfully', userId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error logging scan' })
  }
})

// get logs for a user
router.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id
    const [rows] = await pool.execute(
      'SELECT action, timestamp FROM logs WHERE user_id = ? ORDER BY timestamp DESC',
      [userId]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error fetching logs' })
  }
})

// generate a simple report; accepts query interval=day|week|month
router.get('/report', async (req, res) => {
  try {
    const interval = req.query.interval || 'day'
    let sql = ''
    switch (interval) {
      case 'week':
        sql = "SELECT u.name,u.email,l.action,l.timestamp FROM logs l JOIN users u ON l.user_id=u.id WHERE l.timestamp >= DATE_SUB(NOW(), INTERVAL 1 WEEK) ORDER BY l.timestamp DESC"
        break
      case 'month':
        sql = "SELECT u.name,u.email,l.action,l.timestamp FROM logs l JOIN users u ON l.user_id=u.id WHERE l.timestamp >= DATE_SUB(NOW(), INTERVAL 1 MONTH) ORDER BY l.timestamp DESC"
        break
      default:
        sql = "SELECT u.name,u.email,l.action,l.timestamp FROM logs l JOIN users u ON l.user_id=u.id WHERE l.timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY) ORDER BY l.timestamp DESC"
    }
    const [rows] = await pool.query(sql)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error generating report' })
  }
})

module.exports = router