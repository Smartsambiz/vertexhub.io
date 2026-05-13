const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const protect = require('../middleware/auth');

function generateTicketID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'TR-';
  for (let i = 0; i < 4; i += 1) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

router.post('/create', protect, async (req, res) => {
  try {
    const { fullname, email, phone, txnType, amount, txnRef, description } = req.body;

    if (!fullname || !email || !phone || !txnType || !amount || !txnRef || !description) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const ticketId = generateTicketID();

    const ticket = new Ticket({
      ticketId,
      userId: req.user.id,
      fullname,
      email,
      phone,
      txnType,
      amount,
      txnRef,
      description,
      status: 'SUBMITTED',
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      ticket: {
        id: ticket._id,
        ticketId: ticket.ticketId,
        status: ticket.status,
        submittedAt: ticket.submittedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:ticketId', protect, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const normalizedId = ticketId.toUpperCase().replace(/^#/, '');
    console.log('Looking up ticket ID:', normalizedId, 'for user ID:', req.user.id);
    let ticket = await Ticket.findOne({ ticketId: normalizedId, userId: req.user.id });

    if (!ticket) {
      console.log('Ticket not found');
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const createdAt = new Date(ticket.submittedAt).getTime();
    const ageSec = (Date.now() - createdAt) / 1000;

    if (ticket.status === 'SUBMITTED' && ageSec >= 60) {
      ticket.status = 'IN_PROGRESS';
      await ticket.save();
    }

    if (ticket.status === 'IN_PROGRESS' && ageSec >= 120) {
      ticket.status = 'RESOLVED';
      await ticket.save();
    }

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
