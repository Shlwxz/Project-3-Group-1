// Use D3 to select the table

// Use D3 to create a bootstrap striped table
// https://getbootstrap.com/docs/5.3/content/tables/#striped-rows

// Use D3 to select the table body

// BONUS: Dynamic table
// Loop through an array of grades and build the entire table body from scratch

// Use D3 to select the table
let table = d3.select("#bees_table");
let tbody = table.select("tbody");

let myMap;

// Make Table Interactive
let dt_table = new DataTable('#bees_table');

// Event Listener
d3.select("#filter-btn").on("click", function () {
  doWork();
});

// On Page Load
doWork();

// Helper Functions
function doWork() {
  // Fetch the JSON data and console log it

  // get value
  let min_year = d3.select("#min-year").property("value"); // user input
  let url1 = `/api/v1.0/bar_data/${min_year}`;
  let url2 = `/api/v1.0/table_data/${min_year}`
  let url3 = `/api/v1.0/threat_factors`; // New API for threat factors

  // Make Request
  d3.json(url1).then(function (data) {
    // Make Plot
    makeBarPlot(data);
  });

  d3.json(url2).then(function (data) {
    // Make Table
    makeTable(data);
  });
  
  // Fetch and update the new threat factors chart
  d3.json(url3).then(function (data) {
    makeThreatFactorsChart(data);
  });

  // ADD NEW VISUALIZATIONS
  d3.json(url2).then(makeTrendChart);
  d3.json(url3).then(makeThreatPieChart);
  d3.json(url2).then(makeChoropleth);

  // Load the Sunburst Chart
  makeSunburstChart();
}


function makeTable(data) {
  console.log("Table Data:", data); // Debugging

  if (data.length === 0) {
      console.log("No data received for table.");
      return;
  }

  // Define the desired column order
  const columnOrder = [
      "state",
      "year",
      "total_colonies",
      "total_lost_colonies",
      "avg_percent_lost",
      "avg_percent_renovated",
      "avg_varroa_mites",
      "avg_pesticide_use",
      "avg_diseases",
      "avg_other_pests",
      "avg_unknown_causes"
  ];

  // Mapping of database column names to user-friendly labels
  const columnMappings = {
      "state": "State",
      "year": "Year",
      "total_colonies": "Total Colonies",
      "total_lost_colonies": "Lost Colonies",
      "avg_percent_lost": "Percent Lost",
      "avg_percent_renovated": "Percent Renovated",
      "avg_varroa_mites": "Varroa Mites (%)",
      "avg_pesticide_use": "Pesticide Use (%)",
      "avg_diseases": "Diseases (%)",
      "avg_other_pests": "Other Pests (%)",
      "avg_unknown_causes": "Unknown Causes (%)"
  };

  // Define columns to format as percentages
  const percentageColumns = [
      "avg_percent_lost",
      "avg_percent_renovated",
      "avg_varroa_mites",
      "avg_pesticide_use",
      "avg_diseases",
      "avg_other_pests",
      "avg_unknown_causes"
  ];

  // Ensure only existing columns are used
  let validColumns = columnOrder.filter(column => Object.keys(data[0]).includes(column));

  // Extract and order column headers
  let displayNames = validColumns.map(column => columnMappings[column] || column);

  // Process table data and format percentage values
  let tableValues = validColumns.map(column => 
      data.map(row => {
          if (percentageColumns.includes(column) && row[column] !== null) {
              return `${parseFloat(row[column]).toFixed(2)}%`; // Format as percentage
          }
          return row[column]; // Return as is for non-percentage values
      })
  );

  // Destroy existing table if necessary
  if (document.getElementById("plotlyTable")) {
      Plotly.purge("plotlyTable");
  }

  // Create the Plotly Table
  let plotlyTable = {
      type: 'table',
      header: {
          values: displayNames,  // Use user-friendly names
          align: ["center"],  // Center the column headers
          fill: { color: "lightgray" },
          font: { size: 14, color: "black" }
      },
      cells: {
          values: tableValues,
          align: "center",
          fill: { color: ["white", '#90CAF9'] },
          font: { size: 12 }
      }
  };

  let layout = {
      // title: "Bee Colony Data Table",
      margin: { t: 30, b: 30 }
  };

  Plotly.newPlot("plotlyTable", [plotlyTable], layout);
}


// function makeTable(data) {
//   // Clear Table
//   tbody.html("");
//   dt_table.clear().destroy();

//   // Create Table
//   for (let i = 0; i < data.length; i++) {
//     let row = data[i];

//     // Create Table Row
//     let table_row = tbody.append("tr");

//     // Append Cells
//     table_row.append("td").text(row.state);
//     table_row.append("td").text(row.year);
//     table_row.append("td").text(row.total_colonies);
//     table_row.append("td").text(row.total_lost_colonies);
//     table_row.append("td").text(row.avg_percent_lost);
//     table_row.append("td").text(row.total_renovated_colonies);
//     table_row.append("td").text(row.avg_percent_renovated);
//     table_row.append("td").text(row.avg_varroa_mites);
//     table_row.append("td").text(row.avg_pesticide_use);
//     table_row.append("td").text(row.avg_diseases);
//     table_row.append("td").text(row.avg_other_pests);
//     table_row.append("td").text(row.avg_unknown_causes);

//   }

//   // Make Table Interactive (again)
//   dt_table = new DataTable('#bees_table', {
//     order: [[0, 'desc']] // Sort by column 1 desc
//   });
// }

function makeBarPlot(data) {
  // Create Trace
  let trace = {
    x: data.map(row => row.year),
    y: data.map(row => row.total_lost_colonies),
    type: 'bar',
    marker: {
      color: '#FFC107'
    }
  }

  // Data trace array
  let traces = [trace];

  // Apply a title to the layout
  let layout = {
    title: {
      text: `Total Lost Colonies by Year`
    },
    yaxis: {
      title: {
        text: 'Total Lost Colonies'
      }
    },
    xaxis: {
      title: {
        text: 'Year'
      }
    },
    height: 600
  }

  // Render the plot to the div tag with id "plot"
  Plotly.newPlot('plot', traces, layout);
}

function makeThreatFactorsChart(data) {
  // Extracting data for the bar chart
  let years = data.map(d => d.year);
  let varroaMites = data.map(d => d.avg_varroa_mites);
  let pesticides = data.map(d => d.avg_pesticides);
  let diseases = data.map(d => d.avg_diseases);
  let otherPests = data.map(d => d.avg_other_pests);

  // Check if the chart already exists and destroy it (to prevent duplication)
  if (window.threatFactorsChart instanceof Chart) {
    window.threatFactorsChart.destroy();
  }

  // Select the chart canvas
  const ctx = document.getElementById('threatFactorsChart').getContext('2d');

  // Create the Chart.js bar chart with white background
  window.threatFactorsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years,
      datasets: [
        {
          label: 'Varroa Mites',
          data: varroaMites,
          backgroundColor: '#FFC107', // Honeycomb
          borderColor: '#795548', // Earthy Brown
          borderWidth: 1
        },
        {
          label: 'Pesticides',
          data: pesticides,
          backgroundColor: '#4CAF50', // Pollination Green
          borderColor: '#795548', // Earthy Brown
          borderWidth: 1
        },
        {
          label: 'Diseases',
          data: diseases,
          backgroundColor: '#2196F3', // Sky Blue
          borderColor: '#4CAF50', // Pollination Green
          borderWidth: 1
        },
        {
          label: 'Other Pests',
          data: otherPests,
          backgroundColor: '#F5F5F5', // Bee Wings
          borderColor: '#FFC107', // Honeycomb
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        x: { title: { display: true, text: 'Year' } },
        y: { title: { display: true, text: 'Average Impact (%)' }, beginAtZero: true }
      },
      layout: {
        padding: 10
      },
      backgroundColor: 'white', // Set background color
    }
  });

  // Set the canvas background color manually using CSS
  document.getElementById('threatFactorsChart').style.backgroundColor = 'white';
}

function createMap(min_year) {
  if (!document.getElementById("map")) {
      console.error("Map container not found. Ensure there is a <div id='map'></div> in the HTML.");
      return;
  }

  if (myMap) {
      myMap.remove(); // Prevent duplicate maps
  }

  myMap = L.map("map", {
      center: [37.8, -96], // US Center
      zoom: 4
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
  }).addTo(myMap);
}

// Ensure map creation only runs after DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  createMap(2015);
});

function getColor(d) {
  return d > 25 ? '#4A001F' :  // Dark Burgundy (Extreme Loss)
         d > 20 ? '#800026' :  // Dark Red (Severe Loss)
         d > 15 ? '#D84315' :  // Orange-Red (Very High Loss)
         d > 10 ? '#FF5722' :  // Bright Orange (High Loss)
         d > 5 ? '#FFC107' :  // Yellow-Orange (Moderate-High Loss)
         d > 3 ? '#FFEB3B' :  // Yellow (Moderate Loss)
         d > 2 ? '#C0E218' :  // Light Green-Yellow (Mild Loss)
         d > 1 ? '#4CAF50' :  // Green (Low Loss)
                  '#F5F5F5';    // Light Gray (Minimal or No Data)
}

function makeChoropleth(data) {
  let geoJsonData = "static/data/us-states.json"; 
  d3.json(geoJsonData).then(function (geoData) {
      for (let i = 0; i < data.length; i++) {
          let state = data[i].state;
          let colonyLoss = data[i].avg_percent_lost;

          geoData.features.forEach(feature => {
              if (feature.properties.name === state) {
                  feature.properties.colonyLoss = colonyLoss || 0;
              }
          });
      }

      L.geoJson(geoData, {
          style: function (feature) {
              let loss = feature.properties.colonyLoss || 0;
              return {
                  fillColor: getColor(loss),
                  weight: 1,
                  opacity: 1,
                  color: 'white',
                  fillOpacity: 0.7
              };
          },
          onEachFeature: function (feature, layer) {
              let loss = feature.properties.colonyLoss;
              let lossText = loss !== undefined ? loss.toFixed(2) + "%" : "No Data";
              layer.bindPopup(`<b>${feature.properties.name}</b><br>Colony Loss: ${lossText}`);
          }
      }).addTo(myMap); // Ensure myMap is used
  });
}

function makeTrendChart(data) {
  let states = [...new Set(data.map(d => d.state))];
  
  let traces = states.map(state => {
      return {
          x: data.filter(d => d.state === state).map(d => d.year),
          y: data.filter(d => d.state === state).map(d => d.total_lost_colonies),
          type: 'scatter',
          mode: 'lines',
          name: state
      };
  });

  let layout = {
      title: 'Colony Loss Trends Over Time',
      xaxis: { title: 'Year' },
      yaxis: { title: 'Total Colonies Lost' },
      height: 500
  };

  Plotly.newPlot('trend-chart', traces, layout);
}

function makeThreatPieChart(data) {
  let values = [
      d3.mean(data.map(d => d.avg_varroa_mites)),
      d3.mean(data.map(d => d.avg_pesticides)),
      d3.mean(data.map(d => d.avg_diseases)),
      d3.mean(data.map(d => d.avg_other_pests))
  ];

  let labels = ["Varroa Mites", "Pesticides", "Diseases", "Other Pests"];

  let trace = {
      values: values,
      labels: labels,
      type: 'pie',
      hole: 0.4,  // ✅ Turns it into a donut chart
      marker: {
          colors: [
              "#FFC107",  // Honeycomb (Varroa Mites)
              "#D84315",  // Wildflower Red (Pesticides)
              "#4CAF50",  // Pollination Green (Diseases)
              "#795548"   // Earthy Brown (Other Pests)
          ]
      },
      textinfo: "percent",  // Show percentages inside the donut
      hoverinfo: "label+percent+value"  // Show details on hover
  };

  let layout = {
      title: "🚨 Threats to Bee Colonies 🚨",
      height: 550,
      width: 750
  };

  Plotly.newPlot("pie-chart", [trace], layout);
}

function makeSunburstChart() {
  d3.json("/api/v1.0/sunburst").then(function (data) {
      let trace = {
          type: "sunburst",
          labels: data.labels,
          parents: data.parents,
          values: data.values,
          branchvalues: "total",
          marker: {
              colors: [
                  "#FFC107",  // Honeycomb (Years)
                  "#FF9800",  // Hive Orange (Quarters)
                  "#4CAF50",  // Pollination Green (States)
                  "#2196F3",  // Sky Blue
                  "#795548"   // Earthy Brown
              ]
          }
      };

      let layout = {
        //title: "🌍 Sunburst Chart of Lost Bee Colonies",
        height: 600,   // Keep height reasonable
        width: 600,    // Keep width reasonable
        margin: { t: 20, l: 20, r: 20, b: 20 },  // Reduce margins
        sunburstcolorway: ["#FFC107", "#FF9800", "#4CAF50", "#2196F3", "#795548"],  // Keep colors
        uniformtext: { show: true, minsize: 10 },  // Improve text readability
    };


      Plotly.newPlot("sunburst-chart", [trace], layout);
  });
}