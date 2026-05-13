const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullname: String,
    email: String,
    phone: String,
    txnType: String,
    amount: String,
    txnRef: String,
    description: String,
    status: {
      type: String,
      enum: ['SUBMITTED', 'IN_PROGRESS', 'RESOLVED'],
      default: 'SUBMITTED',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
