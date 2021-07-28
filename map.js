//URL json data

var map_data_url =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
var data_url =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

//Function to fetch json
async function fetchData(id) {
  try {
    const response = await fetch(id, {
      method: "GET",
      credentials: "same-origin",
    });
    const exam = await response.json();
    return exam;
  } catch (error) {
    console.error(error);
  }
}

//Array with color hex
var colorPalet = [
  "#00a0ff",
  "#24adff",
  "#4bbcff",
  "#67c6ff",
  "#93d7ff",
  "#aee1ff",
  "#d1eeff",
];

//Leyenda

var legenddata = [3, 12, 21, 30, 39, 48, 57, 66];
var legendspace = d3.range(0, 400, 50);
var legendsvg = d3
  .select("#legend")
  .append("svg")
  .attr("width", 400)
  .attr("height", 70);

var legendScale = d3.scaleOrdinal().domain(legenddata).range(legendspace);
var legend_axis = d3.axisBottom().scale(legendScale);

legendsvg.append("g").attr("transform", "translate(20,50)").call(legend_axis);

legendsvg
  .selectAll("rect")
  .data(colorPalet.reverse())
  .enter()
  .append("rect")
  .style("fill", function (d, i) {
    return colorPalet[i];
  })
  .attr("x", function (d, i) {
    return i * 50;
  })
  .attr("y", function (d, i) {
    return 34;
  })
  .attr("width", 49)
  .attr("height", 15)
  .attr("transform", "translate(21,0)");

//Map creation

var map_width = 950;
var map_height = 600;

var mainsvg = d3
  .select("#map")
  .append("svg")
  .attr("width", map_width)
  .attr("height", map_height);

var tooltip = d3
  .select(".visHolder")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

//function that catchs the promise and draw the map
async function MapFunction(id) {
  const response = await fetchData(id);
  d3.json(map_data_url, (error, data) => {
    if (error) {
      throw error;
    }
  }).then((data) => {
    const g = mainsvg.append("g");
    const path = d3.geoPath();
    const counties = topojson.feature(data, data.objects.counties);
    g.selectAll("path")
      .data(counties.features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("data-fips", function (d) {
        return d.id;
      })
      .attr("data-education", function (d) {
        let result = response.filter((obj) => {
          if (obj.fips === d.id) {
            return obj;
          }
        });
        if (result) {
          return result[0].bachelorsOrHigher;
        } else {
          return "Data not found";
        }
      })
      .attr("d", path)
      .attr("fill", function (d) {
        var result = response.filter((obj) => {
          if (obj.fips === d.id) {
            return obj;
          }
        });
        if (result) {
          let current = result[0].bachelorsOrHigher;
          let x = 0;
          for (x = 0; x < legenddata.length; x++) {
            if (current > legenddata[x] && current < legenddata[x + 1]) {
              return colorPalet[x];
            }
            if (x == 0 && current < legenddata[x]) {
              return colorPalet[x];
            }
          }
          return colorPalet[colorPalet.length - 1];
        } else {
          return "black";
        }
      })
      .on("mouseover", function (d, i) {
        tooltip
          .transition()
          .duration(150)
          .style("opacity", 0.9)
          .style("left", d.screenX + 25 + "px")
          .style("top", d.screenY - 25 + "px");

        var item = response.filter((obj) => {
          if (obj.fips === i.id) {
            return obj;
          }
        });
        tooltip.attr("data-education", item[0].bachelorsOrHigher);
        tooltip.html(
          item[0].area_name +
            ", " +
            item[0].state +
            ":" +
            item[0].bachelorsOrHigher +
            "%"
        );
      })
      .on("mouseout", function (d) {
        tooltip.transition().duration(200).style("opacity", 0);
      });
  });
}

MapFunction(data_url);
