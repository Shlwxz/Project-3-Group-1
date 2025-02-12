// Use D3 to select the table

// Use D3 to create a bootstrap striped table
// https://getbootstrap.com/docs/5.3/content/tables/#striped-rows

// Use D3 to select the table body

// BONUS: Dynamic table
// Loop through an array of grades and build the entire table body from scratch

// Use D3 to select the table
let table = d3.select("#bees_table");
let tbody = table.select("tbody");

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

  // Make Request
  d3.json(url1).then(function (data) {
    // Make Plot
    makeBarPlot(data);
  });

  d3.json(url2).then(function (data) {
    // Make Table
    makeTable(data);
  });
}


function makeTable(data) {
  // Clear Table
  tbody.html("");
  dt_table.clear().destroy();

  // Create Table
  for (let i = 0; i < data.length; i++) {
    let row = data[i];

    // Create Table Row
    let table_row = tbody.append("tr");

    // Append Cells
    table_row.append("td").text(row.state);
    table_row.append("td").text(row.year);
    table_row.append("td").text(row.total_colonies);
    table_row.append("td").text(row.total_lost_colonies);
    table_row.append("td").text(row.avg_percent_lost);
    table_row.append("td").text(row.total_renovated_colonies);
    table_row.append("td").text(row.avg_percent_renovated);
    table_row.append("td").text(row.avg_varroa_mites);
    table_row.append("td").text(row.avg_pesticide_use);
    table_row.append("td").text(row.avg_diseases);
    table_row.append("td").text(row.avg_other_pests);
    table_row.append("td").text(row.avg_unknown_causes);

  }

  // Make Table Interactive (again)
  dt_table = new DataTable('#bees_table', {
    order: [[0, 'desc']] // Sort by column 1 desc
  });
}


function makeBarPlot(data) {
  // Create Trace
  let trace = {
    x: data.map(row => row.year),
    y: data.map(row => row.total_lost_colonies),
    type: 'bar',
    marker: {
      color: 'firebrick'
    }
  }

  // Data trace array
  let traces = [trace];

  // Apply a title to the layout
  let layout = {
    title: {
      text: `Bee Data`
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
