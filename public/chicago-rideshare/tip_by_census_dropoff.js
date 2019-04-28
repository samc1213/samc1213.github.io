var map = L.map('map').setView([41.881832, -87.623177], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function getColor(d) {
    return d > .07 ? '#800026' :
           d > .06 ? '#BD0026' :
           d > .05 ? '#E31A1C' :
           d > .04 ? '#FC4E2A' :
           d > .03 ? '#FD8D3C' :
           d > .02 ? '#FEB24C' :
           d > .01 ? '#FED976' :
                     '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.avg),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

info.update = function (props) {
  this._div.innerHTML =  (props ?
    '<h3>tip / trip length (miles)</h3><b>$' + props.avg + ' </b><br>Tract ' + props.tract_name
    : 'Hover over a census tract');
};

info.addTo(map);

function getColor(d) {
    return d > .07 ? '#800026' :
           d > .06 ? '#BD0026' :
           d > .05 ? '#E31A1C' :
           d > .04 ? '#FC4E2A' :
           d > .03 ? '#FD8D3C' :
           d > .02 ? '#FEB24C' :
           d > .01 ? '#FED976' :
                      '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.avg),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

var geojson;

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}


let url = 'https://raw.githubusercontent.com/samc1213/chicago-rideshare/master/tip_by_census_dropoff.geojson';
fetch(url).then(r => {
	return r.json();
}).then(data => {
	geojson = L.geoJSON(data, {style: style, onEachFeature: onEachFeature}).addTo(map);
});


