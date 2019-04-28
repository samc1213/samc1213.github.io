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

let url = 'https://raw.githubusercontent.com/samc1213/chicago-rideshare/master/tip_by_census_dropoff.geojson';
fetch(url).then(r => {
	return r.json();
}).then(data => {
	L.geoJSON(data, {style: style}).addTo(map);
});
