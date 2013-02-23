var fs  = require("fs");
var csv = require("csv");

csv().from.stream(fs.createReadStream("script/test.csv"))
.to( console.log );
