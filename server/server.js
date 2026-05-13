const  dns = require('node:dns');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', require('./routes/tickets'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
