
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

  // Create the custom marker icon using Bootstrap's x-diamond-fill icon
  let customIcon = L.divIcon({
    className: 'custom-icon',
    html: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-x-diamond-fill" viewBox="0 0 16 16"><path d="M8 0l4 8-4 8-4-8 4-8z"/></svg>',
    iconSize: [32, 32],  // Adjust the icon size
    iconAnchor: [16, 32],  // Point of the icon which will correspond to the marker's location
    popupAnchor: [0, -32],  // Position of the popup relative to the icon
  });

  // CUSTOM MARKER

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

      let marker = L.marker([row.latitude, row.longitude],{icon: customIcon}).bindPopup(`<h4>Average lost percent: ${row.avg_percent_lost}</h4><h4>Year: ${row.year}</h4><h4>Total Lost Colonies: ${row.total_lost_colonies
      }</h4>`);
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
      Beecolonies: markers
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
