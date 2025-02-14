
function createMap(min_year) {
  // Delete Map
  let map_container = d3.select("#map_container");
  map_container.html(""); // empties it
  map_container.append("div").attr("id", "map"); //recreate it


  // Step 1: CREATE THE BASE LAYERS
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create the custom marker icon
  let customIcon = L.icon({
    iconUrl: 'static/images/your-image.png',  // Path to the image in your local directory
    iconSize: [32, 32],  // Size of the icon
    iconAnchor: [16, 32],  // Point of the icon which will correspond to the marker's location
    popupAnchor: [0, -32],  // Position of the popup relative to the icon
    className: 'custom-marker'  // Optional, add a class for custom styling
  });

  // Assemble the API query URL.
  let url = `/api/v1.0/map_data/${min_year}`;
  console.log(url);

  d3.json(url).then(function (data) {
    // Step 2: CREATE THE DATA/OVERLAY LAYERS
    console.log(data);

    // Initialize the Cluster Group
    let heatArray = [];
    let markers = L.markerClusterGroup();

    // Loop and create marker
    for (let i = 0; i < data.length; i++){
      let row = data[i];

      let marker = L.marker([row.latitude, row.longitude]).bindPopup(`<h1>${row.magnitude}</h1><h3>${row.year}</h3><h4>${row.type}</h4>`);
      markers.addLayer(marker);

      // Heatmap point
      heatArray.push([row.latitude, row.longitude]);
    }

    // Create Heatmap Layer
    let heatLayer = L.heatLayer(heatArray, {
      radius: 25,
      blur: 10
    });

    // Step 3: CREATE THE LAYER CONTROL
    let baseMaps = {
      Street: street,
      Topography: topo
    };

    let overlayMaps = {
      HeatMap: heatLayer,
      Earthquakes: markers
    };

    // Step 4: INITIALIZE THE MAP
    let myMap = L.map("map", {
      center: [40.7128, -74.0059],
      zoom: 7,
      layers: [street, markers]
    });

    // Step 5: Add the Layer Control, Legend, Annotations as needed
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);
  });
}

function init() {
  let min_year = d3.select("#min-year").property("value");
  createMap(min_year);
}

// Event Listener
d3.select("#filter-btn").on("click", function () {
  init();
});

// on page load
init();
