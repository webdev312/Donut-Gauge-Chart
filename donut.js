var prevDonutPoint = 60;

var svg = d3.select(".donut")
	.append("svg")
	.append("g")

svg.append("g")
    .attr("class", "slices");
svg.append("g")
    .attr("class", "mainPoint")
    .attr("transform", function () {
        return "translate(14 ,6)";
    })
    .append('text')
    .attr('class', 'greenPoint');
svg.append("g")
    .attr("class", "mainPercent")
    .attr("transform", function () {
        return "translate(14 ,6)";
    })
    .append('text')
    .attr('class', 'greenPercent');
svg.append("g")
	.attr("class", "labelName");
svg.append("g")
	.attr("class", "labelValue");
svg.append("g")
	.attr("class", "lines");

var width = 960,
    height = 200,
	radius = 150;

var pie = d3.layout.pie()
	.sort(null)
	.value(function(d) {
		return d.value;
	});

var arc = d3.svg.arc()
	.outerRadius(radius * 0.8)
	.innerRadius(radius * 0.65);

var legendRectSize = (radius * 0.05);
var legendSpacing = radius * 0.02;


var div = d3.select("body").append("div").attr("class", "toolTip");

svg.attr("transform", "translate(150, 150)");

datasetTotal = [
		{label:"Category 1", value:0, color:"#CFCFCF"}, 
        {label:"Category 2", value:0, color:"#FF5555"}, 
        {label:"Category 3", value:0, color:"#55FF55"}
];

setInterval(selectDataset, 3000);
changeDonut(datasetTotal);
setTimeout(selectDataset, 500);
	
function selectDataset()
{
    var num1 = Math.floor((Math.random() * 80));
    var num2 = Math.floor((Math.random() * 10 * ((100 - num1) / 10)));
    var num3 = 100 - num1 - num2;
    datasetTotal[0].value = num1;
    datasetTotal[1].value = num2;
    datasetTotal[2].value = num3;

    if (prevDonutPoint > num3){        
        document.getElementById("donutsymbol").classList.remove('glyphicon-triangle-bottom');
        document.getElementById("donutsymbol").classList.remove('glyphicon-triangle-top');
        document.getElementById("donutsymbol").classList.add('glyphicon-triangle-bottom');
        document.getElementById("donutcompareid").classList.remove('red');
        document.getElementById("donutcompareid").classList.remove('green');
        document.getElementById("donutcompareid").classList.add('red');
        document.getElementById("donutcomparetext").innerText = (prevDonutPoint - num3) + "%";
    }else if(prevDonutPoint < num3){
        document.getElementById("donutsymbol").classList.remove('glyphicon-triangle-bottom');
        document.getElementById("donutsymbol").classList.remove('glyphicon-triangle-top');
        document.getElementById("donutsymbol").classList.add('glyphicon-triangle-top');
        document.getElementById("donutcompareid").classList.remove('red');
        document.getElementById("donutcompareid").classList.remove('green');
        document.getElementById("donutcompareid").classList.add('green');
        document.getElementById("donutcomparetext").innerText = (num3 - prevDonutPoint) + "%";
    }
    prevDonutPoint = num3;
    changeDonut(datasetTotal);
}

function changeDonut(data) {
    /* ------- MAIN POINT -------*/
    var start = d3.selectAll('.greenPoint')
        .text(Math.floor(datasetTotal[2].value));

    /* ------- MAIN PERCENT -------*/
    var percent = d3.selectAll('.greenPercent')
        .text("%");

	/* ------- PIE SLICES -------*/
	var slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(data), function(d){ return d.data.label });

    slice.enter()
        .insert("path")
        .style("fill", function(d, i) {return data[i].color })
        .attr("class", "slice");

    slice
        .transition().duration(1000)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
        })
    slice
        .on("mousemove", function(d){
            div.style("left", d3.event.pageX+10+"px");
            div.style("top", d3.event.pageY-25+"px");
            div.style("display", "inline-block");
            div.html((d.data.label)+"<br>"+(d.data.value)+"%");
        });
    slice
        .on("mouseout", function(d){
            div.style("display", "none");
        });

    slice.exit()
        .remove();
};
