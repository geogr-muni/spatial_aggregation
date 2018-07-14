var csv = require("csv-parser");
var fs = require("fs");
var turf = require("turf");
const Json2csvParser = require("json2csv").Parser;
const https = require("https");

const points = [];
var key = "AqiGj_hcXmk8QUwzrcbjvXIPxZsWva6309l6TUtcFmGhz2j1vf2B4M-apV7RUG5H";
let di = 0;
let geocoded = 0;

fs.createReadStream("./gambling.csv")
  .pipe(csv())
  .on("data", data => {
    const point = {
      c: [],
      a: data["street"] + ", " + data["number"] + "," + data["city"]
    };
    points.push(point);
  })
  .on("end", () => {
    points.forEach(function(point, pi) {
      const url = encodeURI(
        "https://dev.virtualearth.net/REST/v1/Locations/Slovakia/" +
          point["a"] +
          "?o=json&key=" +
          key
      );
      setTimeout(() => {
        https.get(url, res => {
          let geocodedData = "";
          res.on("data", dat => {
            geocodedData += dat;
          });
          res.on("end", () => {
            geocoded += 1;
            try {
              const site = JSON.parse(geocodedData).resourceSets[0].resources[0]
                .point;
              //console.log(point);
              point.c = site.coordinates;
            } catch (err) {
              console.log(err);
            }
          });
        });
      }, pi * 150);
    });
  });

var saveFile = function() {
  fs.writeFile(
    "./gambling.js",
    "var gambling = " + JSON.stringify(points),
    () => {
      console.log("gambling.js output saved");
    }
  );
};

var waitUntilAllGeocoded = () => {
  console.log("waiting", geocoded, "/", points.length);
  if (geocoded === points.length && points.length !== 0) {
    saveFile();
  } else {
    setTimeout(() => waitUntilAllGeocoded(), 5000);
  }
};
waitUntilAllGeocoded();

var parseCoordinate = function(coord) {
  return parseFloat(parseFloat(coord).toPrecision(6));
};
