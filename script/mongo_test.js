// Mongo configuration parameters
var MONGO_ROOT_URL = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/';
var MONGO_URL = MONGO_ROOT_URL + 'movepgh';

// Setup mongoose and the facet model
var mongoose = require("mongoose");
var facet_model = require("../model/facet_model");

mongoose.connect(MONGO_URL);

var test_facet = {
  id: "cost",
  name: "Cost of Living",
  description: "It's expensive",
  category: "Money",
  scores: {
    "shadyside": 4,
    "north_side": 3
  }
};

var myTest = facet_model(test_facet);
myTest.save( function (err) {
  if (err) {
    console.log("Error: " + err);
    return;
  }

  console.log("Saved the thing");
});
