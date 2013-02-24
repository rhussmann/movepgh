var facet_model = require("../model/facet_model")


var FacetController =  {
  getFacets: function(callback) {
    facet_model.find({}, {neighborhood_scores: 0, _id: 0}, function(err, docs) {
      callback(docs)
    });
  },
  getFacetsForResponse: function(req, resp) {
    this.getFacets(function(facets) {
      resp.send(facets)
    })
  }
}


module.exports = FacetController