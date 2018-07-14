"use strict";

var map;
var maxX = 50,
    minX = 0,
    maxY = 49.5,
    minY = 0;
var noTestData = 1000;
var randomData = [];

var grid;

console.log(data);

var elementValue = function elementValue(id) {
  var parse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var value = document.getElementById(id).value;
  return parse ? parseInt(value) : value;
};

document.addEventListener("DOMContentLoaded", function (event) {
  console.log("dom loaded");

  var colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"];
  createRandomData();

  map = L.map("map-content");
  map.fitBounds([[minY, minX], [maxY, maxX]]);

  L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    opacity: 0.3
  }).addTo(map);

  var selects = [].slice.call(document.getElementsByClassName("render-on-change"), 0);
  selects.map(function (select) {
    if (select.addEventListener) {
      select.addEventListener("change", function () {
        render();
      });
    }
  });

  render();
});

var render = function render() {
  console.log(grid);
  if (map.hasLayer(grid)) {
    grid.unregister();
    map.removeLayer(grid);
  }

  grid = L.regularGridCluster({
    rules: getRules(),
    zoomShowElements: elementValue("select-elements-zoom", true),
    zoomHideGrid: elementValue("select-grid-zoom", true),
    zoneSize: elementValue("select-zone-size", true),
    gridMode: elementValue("select-grid-mode"),
    showCells: elementValue("select-show-cells") === "1",
    showEmptyCells: elementValue("select-show-empty-cells") === "1",
    showMarkers: elementValue("select-show-markers") === "1",
    showTexts: elementValue("select-show-texts") === "1",
    trackingTime: true
  });

  grid.addLayers(randomData);
  grid.addTo(map);
};

var createRandomData = function createRandomData() {
  for (var i = 0; i < noTestData; i++) {
    var coordinates = [minX + Math.random() * (maxX - minX), minY + Math.random() * (maxY - minY)];
    var properties = {
      a: 5 + Math.floor(Math.random() * 5),
      b: Math.floor(Math.random() * 5)
    };

    var marker = L.circleMarker(coordinates, circleStyle(properties));
    randomData.push({ marker: marker, properties: properties });
  }
};

var parseTextAreaValue = function parseTextAreaValue(textAreaId) {
  var textAreaValue = document.getElementById(textAreaId).value;
  var textAreaObjectValue = "{" + textAreaValue + "}";

  try {
    return JSON.parse(textAreaObjectValue);
  } catch (err) {
    console.log(err);
    alert("bad input " + textAreaId + ", " + err);
    return {};
  }
};

var getRules = function getRules() {
  var rulesTextCells = parseTextAreaValue("textarea-rules-cells");
  var rulesTextMarkers = parseTextAreaValue("textarea-rules-markers");
  var rulesTextTexts = parseTextAreaValue("textarea-rules-texts");

  return {
    cells: rulesTextCells,
    markers: rulesTextMarkers,
    texts: rulesTextTexts
  };
};

var circleStyle = function circleStyle(props) {
  return {
    fillColor: ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"][props.b],
    color: "black",
    weight: 1,
    radius: props.a / 3,
    fillOpacity: 1
  };
};
'use strict';

L.Control.ZoomDisplay = L.Control.extend({
  options: {
    position: 'topleft'
  },

  onAdd: function onAdd(map) {
    this._map = map;
    this._container = L.DomUtil.create('div', 'leaflet-control-zoom-display leaflet-bar-part leaflet-bar');
    this.updateMapZoom(map.getZoom());
    map.on('zoomend', this.onMapZoomEnd, this);
    return this._container;
  },

  onRemove: function onRemove(map) {
    map.off('zoomend', this.onMapZoomEnd, this);
  },

  onMapZoomEnd: function onMapZoomEnd(e) {
    this.updateMapZoom(this._map.getZoom());
  },

  updateMapZoom: function updateMapZoom(zoom) {
    if (typeof zoom === 'undefined') {
      zoom = '';
    }
    this._container.innerHTML = zoom;
  }
});

L.Map.mergeOptions({
  zoomDisplayControl: true
});

L.Map.addInitHook(function () {
  if (this.options.zoomDisplayControl) {
    this.zoomDisplayControl = new L.Control.ZoomDisplay();
    this.addControl(this.zoomDisplayControl);
  }
});

L.control.zoomDisplay = function (options) {
  return new L.Control.ZoomDisplay(options);
};
