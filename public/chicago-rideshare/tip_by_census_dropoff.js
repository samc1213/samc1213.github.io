var tipMap = L.map('tip').setView([41.881832, -87.623177], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(tipMap);

var tipRanges= [0, .01, .02, .03, .04, .05, .06, .07];


function getTipColor(d) {
    return d > tipRanges[7] ? '#800026' :
           d > tipRanges[6] ? '#BD0026' :
           d > tipRanges[5] ? '#E31A1C' :
           d > tipRanges[4] ? '#FC4E2A' :
           d > tipRanges[3] ? '#FD8D3C' :
           d > tipRanges[2] ? '#FEB24C' :
           d > tipRanges[1] ? '#FED976' :
                                  '#FFEDA0';
}

function tipStyle(feature) {
    return {
        fillColor: getTipColor(feature.properties.avg),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

var tipInfo = L.control();

tipInfo.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'tipInfo');
  this.update();
  return this._div;
};

tipInfo.update = function (props) {
  this._div.innerHTML =  (props ?
      '<div class="map-container"><div class="map-title">Average Tip Per Distance Traveled ($/mile)</div><div class="map-value">$' + props.avg + '/mi </div><div class="map-subvalue">Tract ' + props.tract_name + '</div>'
    : '<div class="map-container"><div class="map-title">Average Tip Per Distance Traveled ($/mile)</div><div class="map-subvalue">Hover over a census tract</div></div>');
};

tipInfo.addTo(tipMap);

var tipGeoJson;

function highlightTipFeature(e) {
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

    tipInfo.update(layer.feature.properties);
}

function resetTipHighlight(e) {
    tipGeoJson.resetStyle(e.target);
    tipInfo.update();
}

function onEachTipFeature(feature, layer) {
    layer.on({
        mouseover: highlightTipFeature,
        mouseout: resetTipHighlight,
        click: highlightTipFeature
    });
}

var tipLegend = L.control({position: 'bottomright'});

tipLegend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'tipInfo legend');
    for (var i = 0; i < tipRanges.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getTipColor(tipRanges[i] + .001) + '"></i> $' +
            tipRanges[i] + (tipRanges[i + 1] ? '&ndash;$' + tipRanges[i + 1] + '<br>' : '+');
    }

    return div;
};

tipLegend.addTo(tipMap);

var url = 'https://raw.githubusercontent.com/samc1213/chicago-rideshare/master/tip_by_census_dropoff.geojson';
fetch(url).then(r => {
	return r.json();
}).then(data => {
	tipGeoJson = L.geoJSON(data, {style: tipStyle, onEachFeature: onEachTipFeature}).addTo(tipMap);
});


