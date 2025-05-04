let data = [1, 2];
let total = 0;
for (let d of data) {
  total += d;
}
let angle = 0;
let arcData = [];

for (let d of data) {
  let endAngle = angle + (d / total) * 2 * Math.PI;
  arcData.push({ startAngle: angle, endAngle });
  angle = endAngle;
}
let arcs = arcData.map((d) => arcGenerator(d));
let colors = ['gold', 'purple'];

arcs.forEach((arc, idx) => {
  d3.select('svg')
    .append('path')
    .attr('d', arc)
    .attr('fill', colors[idx]) 
    .attr('stroke', 'white')
    .attr('stroke-width', 2);
});