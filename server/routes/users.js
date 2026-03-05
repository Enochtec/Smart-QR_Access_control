const express = require('express')
const router = express.Router()
const pool = require('../db')
const QRCode = require('qrcode')

// register a new user and generate QR code
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, employeeId, department, jobTitle, dob, bloodType, photo, emergencyContact, emergencyPhone, notificationFrequency } = req.body

    // simple validation
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' })
    }

    // create a random token to encode in QR
    const token = require('crypto').randomBytes(16).toString('hex')

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, phone, employee_id, department, job_title, date_of_birth, blood_type, photo, emergency_contact_name, emergency_contact_phone, notification_frequency, qr_token) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone || null, employeeId || null, department || null, jobTitle || null, dob || null, bloodType || null, photo || null, emergencyContact || null, emergencyPhone || null, notificationFrequency || 'daily', token]
    )
    const userId = result.insertId

    // generate qr code as data URL; encode token
    const qrData = await QRCode.toDataURL(token)

    // return user info and qr image
    res.json({ id: userId, name, email, phone, employeeId, department, jobTitle, qrToken: token, qrData })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error registering user' })
  }
})

// get a user's card (info & qr) by id
router.get('/:id/card', async (req, res) => {
  try {
    const userId = req.params.id
    const [rows] = await pool.execute('SELECT id, name, email, photo, qr_token FROM users WHERE id = ?', [userId])
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' })
    const user = rows[0]
    const qrData = await QRCode.toDataURL(user.qr_token)
    res.json({ ...user, qrData })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error fetching user' })
  }
})

module.exports = router
