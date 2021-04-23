var map = L.map('map').setView([37.8, -96], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://clearbit.com">College Logos provided by Clearbit</a>'
}).addTo(map);


colleges = [

    {
        name: 'DePaul University',
        lat: 41.877618,
        lon: -87.62724,
        url: 'https://www.depaul.edu',
        announcement_url: 'https://resources.depaul.edu/newsline/sections/campus-and-community/Pages/COVID-19-vaccine-April-21.aspx'
    },

    {
        name: 'Loyola University Chicago',
        lat: 42.000765,
        lon: -87.656872,
        url: 'https://www.luc.edu',
        announcement_url: 'https://www.luc.edu/coronavirus/vaccine/'
    }

]

var markers = L.markerClusterGroup();

colleges.forEach(college => {
    var icon = L.divIcon({
        className: 'school-icon',
        html: `<img class="school-icon" src="http://logo.clearbit.com/${college.url}" />`,
        iconSize: [20, 20]
    });
    
    let newMarker = L.marker([college.lat, college.lon], {icon: icon});
    newMarker.bindPopup(`<div class="school-popup"><h4>${college.name}</h4><a href="${college.announcement_url}" target="_blank">Announcement</a><br> <img src="http://logo.clearbit.com/${college.url}" /></div>`)
    markers.addLayer(newMarker);
})

map.addLayer(markers);