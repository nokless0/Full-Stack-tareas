const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

usuarioSchema.methods.comparePassword = function(pwd) {
  return bcrypt.compare(pwd, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
