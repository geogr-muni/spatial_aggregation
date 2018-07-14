var csv = require("csv-parser");
var fs = require("fs");
var turf = require("turf");
const Json2csvParser = require("json2csv").Parser;

const coded = [];
fs.createReadStream("crime.csv")
  .pipe(csv())
  .on("data", data => {
    const point = turf.point([
      parseCoordinate(data["x"]),
      parseCoordinate(data["y"])
    ]);

    const feature = turf.feature(point, {
      id: data["id"],
      category: data["category"],
      type: data["type"],
      date: data["date"],
      time: data["time"]
    });
    coded.push(feature);
  })
  .on("end", () => {
    var collection = turf.featureCollection(coded);
    fs.writeFile("crime.json", JSON.stringify(collection), () => {
      console.log("crime.json output saved");
    });
  });

var parseCoordinate = function(coord) {
  return parseFloat(coord).toPrecision(7);
};
