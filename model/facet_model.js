var mongoose = require("mongoose");

var facet_schema = mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  neigborhood_scores: {}
});

module.exports = mongoose.model('facet', facet_schema);