var fs  = require("fs")
var csv = require("csv")

// Mongo configuration parameters
var MONGO_ROOT_URL = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/';
var MONGO_URL = MONGO_ROOT_URL + 'movepgh';

// Setup mongoose and the facet model
var mongoose = require("mongoose");
var facet_model = require("../model/facet_model");

// Connect to mongo
mongoose.connect(MONGO_URL);

csv().from.stream(fs.createReadStream("script/csv/move-to-pitt_data - Facets.csv"))
.transform( function(row, index){
  if (index === 0) return
  var facet = {}
  facet.id = row[0]
  facet.name = row[1]
  facet.description = row[2]
  facet.category = row[3]
  console.log(JSON.stringify(facet))

  facet_model.findOneAndUpdate({id: facet.id}, facet, {upsert: true}, function updateHandler(err) {
    if (err) {
      console.log("Unable to update facet. " + err);
      retun;
    } else {
      console.log("Facet " + facet.id + " updated");
    }
  })
});
