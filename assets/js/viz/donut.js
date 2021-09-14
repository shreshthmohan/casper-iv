// import swatches from './swatches'

// https://docs.google.com/spreadsheets/d/e/2PACX-1vTfk5ELixoKzYE8Mcjja487XDH95hu_JCAyvhmbq1LYlko5hXjyQL3MWuIfovDjMPfjnixd73ONdDc-/pub?gid=436839185&single=true&output=csv
const renderDonut = async function (svgNode, data, dimensions, options = {}) {
  const {
    // Chart Area
    // svgWidth,
    // svgHeight,
    aspectRatio = 2, // width / height

    marginTop = 10,
    marginRight = 10,
    marginBottom = 10,
    marginLeft = 10,

    bgColor = "transparent",

    innerRadius = undefined,
    outerRadius = undefined,
    donutThickness = 0.75, // (0, 1]
    chosenColorScheme = "interpolateBrBG",
  } = options;

  const {
    // Column Mapping
    arcField: arcFields,
    colorField: colorFields,
  } = dimensions;

  const [{ name: arcField }] = arcFields;
  const [{ name: colorField }] = colorFields;

  let fetchedData;
  // data is to be fetched from a url
  if (typeof data === "string") {
    fetchedData = await d3.csv(data);
  } else {
    fetchedData = data;
  }
  // console.log({ fetchedData });

  // Destroy & recreate svg
  const svgParent = d3.select(svgNode);

  const svgParentWidth = svgParent.node().getBoundingClientRect().width;
  svgParent.select("svg").remove();
  svgParent.select("iv-widget").remove();

  const svgWidth = svgParentWidth;
  const svgHeight = svgWidth / aspectRatio;

  const width = svgWidth - marginLeft - marginRight;
  const height = svgHeight - marginTop - marginBottom;
  const outerRadiusFinal = outerRadius
    ? Math.min(outerRadius * 2, width, height) / 2
    : Math.min(width, height) / 2;

  // default innerRadius is 80% of outerRadius
  const innerRadiusFinal = innerRadius ?? donutThickness * outerRadiusFinal;

  console.log({
    innerRadiusFinal,
    outerRadiusFinal,
    innerRadius,
    outerRadius,
    width,
    height,
    donutThickness,
  });
  const svg = svgParent
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("background", bgColor);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${marginLeft} , ${marginTop})`)
    .attr("id", "viz");

  // let colorLegendContainer
  // d3.select('#legend-bubble').remove()
  // if (colorField) {
  //   colorLegendContainer = svgParent.append('div').attr('id', 'legend-bubble')
  // }

  // Scales
  // color-scale
  const colorDomain = _.chain(fetchedData)
    .map(colorField)
    .uniq()
    .value()
    // remove falsy values (null, undefined, '')
    .filter((d) => !!d);

  // const colorSchemeOptions = [d3.schemeCategory10, d3.quantize()]
  // const interpolatedColorSchemes = [d3.interpolateBlues, d3.interpolateGreens]
  // const selectedInterpolateScheme = 0

  // console.log({ chosenColorScheme, colorDomain, colorField });

  // offset + range should not be outside [0,1]
  // Example: Let's say our chosen scheme is interpolateRdBu
  // If offset is 0, range is 1 and we have to choose two colors
  // quantize will select red and blue (extremes) for us
  // If we choose offset to be closer to 1, say 0.8 and range as 0.2
  // both our colors will be similar shades of blue
  const colorInterpolate = { offset: 0.2, range: 0.3 };
  const interpolatedRange = d3.quantize(
    (t) =>
      // eslint-disable-next-line import/namespace
      d3[chosenColorScheme](
        colorInterpolate.offset + colorInterpolate.range * t
      ),
    colorDomain.length
  );

  const colorScale = d3
    .scaleOrdinal()
    .domain(colorDomain)
    // .range(d3.schemeCategory10)
    .range(interpolatedRange);

  const pie = d3.pie().value(function (d) {
    return d[arcField];
  });
  const arcs = pie(fetchedData);

  const arcEval = d3
    .arc()
    .innerRadius(innerRadiusFinal) // This is the size of the donut hole
    .outerRadius(outerRadiusFinal);

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  chart
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`)
    .selectAll("path")
    .data(arcs)
    .join("path")
    .attr("d", arcEval)
    .attr("fill", function (d) {
      return colorScale(d.data[colorField]);
    })
    .attr("stroke", bgColor);

  chart
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`)
    .attr("font-family", "sans-serif")
    .attr("font-size", 12)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .selectAll("text")
    .data(arcs)
    .join("text")
    .attr("transform", (d) => `translate(${arcEval.centroid(d)})`)
    .call((text) =>
      text
        .append("tspan")
        .attr("y", "-0.4em")
        .attr("font-weight", "bold")
        .text((d) => d.data[colorField])
    )
    .call((text) =>
      text
        // .filter((d) => d.endAngle - d.startAngle > 0.25)
        .append("tspan")
        .attr("x", 0)
        .attr("y", "0.7em")
        .attr("fill-opacity", 0.7)
        .text((d) => {
          return d.data[arcField].toLocaleString();
        })
    );

  // Render

  // Chart Background
  svg.style("background-color", bgColor);
};
