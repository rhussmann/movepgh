var facet_model = require("../model/facet_model")


var FacetController =  {
    getFacets: function(req, resp) {
      facet_model.find({}, {neighborhood_scores: 0, _id: 0}, function(err, docs) {
        resp.send(docs)
      });
    }
}


module.exports = FacetController