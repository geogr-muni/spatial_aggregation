var map;
var grid;
var gridGambling;
var gridCrime;

var extent = [[49.98, 15.7], [50.08, 15.85]];

var elementValue = (id, parse = false) => {
  const value = document.getElementById(id).value;
  return parse ? parseInt(value) : value;
};

var crimePoints = [];
var gamblingPoints = [];

console.log(gambling);

document.addEventListener("DOMContentLoaded", function(event) {
  console.log("dom loaded");

  const colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"];
  prepareData();

  // setting map
  map = L.map("map-content");
  map.fitBounds(extent);

  var CartoDB_Positron = L.tileLayer(
    "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
      subdomains: "abcd",
      maxZoom: 19
    }
  );
  CartoDB_Positron.addTo(map);

  const selects = [].slice.call(
    document.getElementsByClassName("render-on-change"),
    0
  );
  selects.map(select => {
    if (select.addEventListener) {
      select.addEventListener("change", () => {
        render();
      });
    }
  });

  render();
});

const prepareData = () => {
  crimePoints = crime.points.map(point => {
    return {
      marker: L.circleMarker(point["c"], circleStyle(point, "red")),
      properties: point
    };
  });
  gamblingPoints = gambling.map(point => {
    return {
      marker: L.circleMarker(point["c"], circleStyle(point, "black")),
      properties: point
    };
  });
};

const parseTextAreaValue = textAreaId => {
  const textAreaValue = document.getElementById(textAreaId).value;
  const textAreaObjectValue = "{" + textAreaValue + "}";

  try {
    return JSON.parse(textAreaObjectValue);
  } catch (err) {
    console.log(err);
    alert("bad input " + textAreaId + ", " + err);
    return {};
  }
};

const circleStyle = (props, color) => {
  return {
    //fillColor: ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"][
    //  props.cid
    //],
    fillColor: color,
    color: color,
    radius: 1
  };
};

var render = () => {
  if (map.hasLayer(gridCrime)) {
    gridCrime.unregister();
    map.removeLayer(gridCrime);
    gridGambling.unregister();
    map.removeLayer(gridGambling);
  }

  gridOptions = {
    rules: {
      cells: {
        fillColor: {
          method: "count",
          scale: "quantile",
          range: ["#fdd49e", "#fdbb84", "#fc8d59", "#e34a33", "#b30000"]
        },
        color: "white",
        fillOpacity: 1,
        weight: 1.5
      },
      markers: {
        color: "white",
        weight: 2,
        fillOpacity: 1,
        fillColor: "black",
        radius: {
          method: "count",
          attribute: "",
          scale: "continuous",
          range: [7, 15]
        }
      }
    },
    zoomShowElements: false,
    zoomHideGrid: 20,
    zoneSize: elementValue("select-zone-size", true),
    gridMode: elementValue("select-grid-mode"),
    showMarkers: false,
    showCells: false,
    showEmptyCells: true, //elementValue("select-show-empty-cells") === "1",
    gridOrigin: { lat: extent[0][0], lng: extent[0][1] },
    gridEnd: { lat: extent[1][0], lng: extent[1][1] },
    emptyCellOptions: {
      color: "white",
      fillColor: "white"
    }
  };

  // define RegularGridCluster instance
  gridCrime = L.regularGridCluster(
    Object.assign({}, gridOptions, {
      zoomShowElements:
        elementValue("select-show-points-crime") === "1" ? 5 : 20,
      showCells: elementValue("select-show-cells") === "1"
    })
  );

  gridGambling = L.regularGridCluster(
    Object.assign({}, gridOptions, {
      zoomShowElements:
        elementValue("select-show-points-gambling") === "1" ? 5 : 20,
      showMarkers: elementValue("select-show-markers") === "1"
    })
  );

  gridCrime.addLayers(crimePoints);
  gridCrime.addTo(map);

  gridGambling.addLayers(gamblingPoints);
  gridGambling.addTo(map);
};
