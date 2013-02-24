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
  },
  getFacetNameLookup: function(callback) {
    facet_model.find({}, function(err, facets) {
      var map = {}
      facets.forEach(function(f) {
        map[f.id] = f.name
      })
      callback(map)
    })
  }
}


module.exports = FacetController