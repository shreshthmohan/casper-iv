const renderGroupedBar = async function (
  svgNode,
  data,
  dimensions,
  options = {}
) {
  const {
    // Chart Area
    // svgWidth,
    // svgHeight,
    aspectRatio = 2,

    marginTop = 10,
    marginRight = 10,
    marginBottom = 10,
    marginLeft = 10,

    bgColor = "transparent",
    // barColor,

    xAxisLabelOffset = 0,
    yAxisLabelOffset = 0,
  } = options;

  const {
    // Column Mapping
    xField: xFields,
    yField: yFields,
  } = dimensions;

  const [{ name: xField }] = xFields;
  const [{ name: yField }] = yFields;

  let fetchedData;
  // data is to be fetched from a url
  if (typeof data === "string") {
    fetchedData = await d3.csv(data);
  } else {
    fetchedData = data;
  }

  // Destroy & recreate svg
  const svgParent = d3.select(svgNode);

  const svgParentWidth = svgParent.node().getBoundingClientRect().width;
  svgParent.select("svg").remove();
  svgParent.select("iv-widget").remove();

  const svgWidth = svgParentWidth;
  const svgHeight = svgWidth / aspectRatio;

  const width = svgWidth - marginLeft - marginRight;
  const height = svgHeight - marginTop - marginBottom;

  // Scales
  // x-scale
  const xDomain = _.chain(fetchedData)
    .map(xField)
    .uniq()
    .value()
    // remove falsy values (null, undefined, '')
    .filter((d) => !!d);
  const xScale = d3.scaleBand().domain(xDomain).range([0, width]).padding(0.1);

  // x-group-scale
  const keys = _.map(yFields, "name");
  // debugger
  const xGroupScale = d3
    .scaleBand()
    .domain(keys)
    .range([0, xScale.bandwidth()])
    .padding(0.1);

  // Color scale
  const colorScale = d3.scaleOrdinal().domain(keys).range(d3.schemeCategory10);

  // y-scale
  const yMaxes = [];
  _.forEach(keys, function (key) {
    yMaxes.push(_.maxBy(fetchedData, key)[key]);
  });

  const yMax = _.max(yMaxes);
  console.log({ yMax });
  const yDomain = [0, yMax];

  const yScale = d3
    .scaleLinear()
    .domain(yDomain)
    .rangeRound([height, 0])
    .nice();

  // Render
  // Chart Background
  // svg.attr("fill", bgColor);

  // Chart
  // const series = d3.stack().keys(keys)(fetchedData)
  const svg = svgParent
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("background", bgColor);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${marginLeft} , ${marginTop})`)
    .attr("id", "viz");

  chart
    .append("g")
    .selectAll("g")
    // Enter in data = loop group per group
    .data(keys)
    .join("g")
    // .attr('transform', (d) => `translate(${xScale(d)}, 0)`)
    .selectAll("rect")
    .data(function (d) {
      const v = _.map(fetchedData, function (val, key) {
        return { x: val[xField], y: val[d], key: d };
      });
      // debugger;
      return v;
    })
    .join("rect")
    .attr("x", (d) => xScale(d.x) + xGroupScale(d.key))
    .attr("y", (d) => yScale(d.y))
    .attr("width", xGroupScale.bandwidth())
    .attr("height", (d) => height - yScale(d.y))
    .attr("fill", (d) => colorScale(d.key));

  // chart
  //   .append('g')
  //   .selectAll('g')
  //   .data(series)
  //   .join('g')
  //   .attr('fill', (d) => colorScale(d.key))
  //   .selectAll('rect')
  //   .data((d) => d)
  //   .join('rect')
  //   .attr('x', (d, i) => xScale(d.data[xField]) + xGroupScale(d.key))
  //   .attr('y', (d) => yScale(d[1]))
  //   .attr('height', (d) => yScale(d[0]) - yScale(d[1]))
  //   .attr('width', xScale.bandwidth())

  //     .append('title')
  //     .text(
  //       (d) => `${d.data.name} ${d.key}
  // ${formatValue(d.data[d.key])}`
  //     )
  // chart
  //   .selectAll('rect')
  //   .data(fetchedData)
  //   .enter()
  //   .append('rect')
  //   .attr('class', 'bar')
  //   .attr('x', function (d) {
  //     return xScale(d[xField])
  //   })
  //   .attr('width', xScale.bandwidth())
  //   .attr('y', function (d) {
  //     return yScale(d[yField])
  //   })
  //   .attr('height', function (d) {
  //     return height - yScale(d[yField])
  //   })
  //   .attr('fill', barColor)

  // Axes
  const axes = svg.append("g").attr("id", "axes");

  const xAxis = axes
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(${marginLeft},${marginTop + height})`);

  xAxis
    .append("g")
    .call(d3.axisBottom(xScale))
    .call((g) => g.selectAll(".tick line").attr("stroke-opacity", 0.1));
  // .call((g) => g.select('.domain').remove())

  xAxis
    .append("text")
    .attr("transform", `translate(${width / 2},${xAxisLabelOffset})`)
    .style("text-anchor", "middle")
    .style("dominant-baseline", "top")
    .attr("class", "text-xs ")
    .text(xField);

  const yAxis = axes
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(${marginLeft},${marginTop})`);

  yAxis
    .append("g")
    .call(d3.axisLeft(yScale))
    .call((g) => g.selectAll(".tick line").attr("stroke-opacity", 0.1));
  // .call((g) => g.select('.domain').remove())

  yAxis
    .append("text")
    .attr(
      "transform",
      `translate(${-yAxisLabelOffset},${height / 2}), rotate(-90)`
    )
    .style("text-anchor", "middle")
    .style("dominant-baseline", "top")
    .attr("class", "text-xs ")
    .text(yField);
};
