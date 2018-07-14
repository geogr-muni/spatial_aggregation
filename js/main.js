var map;
var points = [];
var grid;

var extent = [[49.98, 15.7], [50.08, 15.85]];

console.log(data);

var elementValue = (id, parse = false) => {
  const value = document.getElementById(id).value;
  return parse ? parseInt(value) : value;
};

document.addEventListener("DOMContentLoaded", function(event) {
  console.log("dom loaded");

  const colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"];
  points = prepareData();
  console.log(points);

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
  return data.points.map(point => {
    return {
      marker: L.circleMarker(point["c"], circleStyle(point)),
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

const getRules = () => {
  const rulesTextCells = parseTextAreaValue("textarea-rules-cells");
  const rulesTextMarkers = parseTextAreaValue("textarea-rules-markers");
  const rulesTextTexts = parseTextAreaValue("textarea-rules-texts");

  return {
    cells: rulesTextCells,
    markers: rulesTextMarkers,
    texts: rulesTextTexts
  };
};

const circleStyle = props => {
  return {
    //fillColor: ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"][
    //  props.cid
    //],
    radius: 1
  };
};

var render = () => {
  console.log(grid);
  if (map.hasLayer(grid)) {
    grid.unregister();
    map.removeLayer(grid);
  }

  // define RegularGridCluster instance
  grid = L.regularGridCluster({
    rules: getRules(),
    zoomShowElements: elementValue("select-elements-zoom", true),
    zoomHideGrid: elementValue("select-grid-zoom", true),
    zoneSize: elementValue("select-zone-size", true),
    gridMode: elementValue("select-grid-mode"),
    showCells: elementValue("select-show-cells") === "1",
    showEmptyCells: false, //elementValue("select-show-empty-cells") === "1",
    showMarkers: false, //elementValue("select-show-markers") === "1",
    showTexts: false, //elementValue("select-show-texts") === "1",
    trackingTime: true,
    gridOrigin: { lat: extent[0][0], lng: extent[0][1] },
    gridEnd: { lat: extent[1][0], lng: extent[1][1] }
  });

  grid.addLayers(points);
  grid.addTo(map);
};
