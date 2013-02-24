var mongoose = require("mongoose");

var hood_schema = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  images: []
});

module.exports = mongoose.model('neighborhood', hood_schema);