var fs  = require("fs")
var csv = require("csv")

csv().from.stream(fs.createReadStream("script/csv/move-to-pitt_data - Facets.csv"))
.transform( function(row, index){
	if (index === 0) return
	var facet = {}
	facet.id = row[0]
	facet.name = row[1]
	facet.description = row[2]
	facet.category = row[3]
	console.log(JSON.stringify(facet))
});
