require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error(err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Backend en puerto ${PORT}`));
}

module.exports = app;
