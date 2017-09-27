var prevGaugePoint = 0;
var d3;

var config = {
    size						: 200,
    clipWidth					: 200,
    clipHeight					: 110,
    ringInset					: 20,
    ringWidth					: 20,
    arcColor                    : "#AAAAAA",
    
    pointerWidth				: 5,
    pointerTailLength			: 1,
    pointerHeadLengthPercent	: 0.82,
    
    minValue					: 0,
    maxValue					: 100,
    
    minAngle					: -90,
    maxAngle					: 90,
    
    transitionMs				: 750,
    
    secondArcStart              : 30,
    secondArcEnd                : 90,
    secondArcColor              : "#DDFFDD",

    thirdArcStart               : 50,
    thirdArcEnd                 : 70,
    thirdArcColor               : "#00FF00",

    NeedleColor                 : "dimgrey",
    
    majorTicks					: 10,
    labelFormat					: "%",
    labelInset					: 10,
    
    arcColorFn					: d3.interpolateHsl(d3.rgb('#e8e2ca'), d3.rgb('#3e6c0a'))
};

var gauge = function(container, configuration) {
	var that = {};
	
	var range;
	var r;
	var pointerHeadLength;
	
	var svg;
    var arcGrey, arcLightGreen, arcGreen;
    var pointerTail, pointerCircle;
	var scale;
	var ticks;
	var tickData;
	var pointer;

	d3.layout.pie();
	
	function deg2rad(deg) {
		return deg * Math.PI / 180;
	}
	
	function configure(configuration) {
		for (var prop in configuration ) {
			config[prop] = configuration[prop];
		}
		
		range = config.maxAngle - config.minAngle;
		r = config.size / 2;
		pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

		// a linear scale that maps domain values to a percent from 0..1
		scale = d3.scale.linear()
			.range([0,1])
			.domain([config.minValue, config.maxValue]);
			
		ticks = scale.ticks(config.majorTicks);
        tickData = d3.range(config.majorTicks).map(function() {return 1/config.majorTicks;});
        
		arcGrey = d3.svg.arc()
			.innerRadius(r * 0.8)
			.outerRadius(r * 0.85)
			.startAngle(function(d, i) {
                var ratio = d * i;
				return deg2rad(config.minAngle + (ratio * range));
			})
			.endAngle(function(d, i) {
                var ratio = d * (i+1);
				return deg2rad(config.minAngle + (ratio * range));
            });
            
        arcLightGreen = d3.svg.arc()
			.innerRadius(r * 0.75)
			.outerRadius(r * 0.9)
			.startAngle(deg2rad(config.minAngle + 180 / 100 * config.secondArcStart))
            .endAngle(deg2rad(config.minAngle + 180 / 100 * config.secondArcEnd));

        arcGreen = d3.svg.arc()
			.innerRadius(r * 0.75)
			.outerRadius(r * 0.9)
			.startAngle(deg2rad(config.minAngle + 180 / 100 * config.thirdArcStart))
			.endAngle(deg2rad(config.minAngle + 180 / 100 * config.thirdArcEnd));
	}
	that.configure = configure;
	
	function centerTranslation() {
		return 'translate('+r +','+ r +')';
	}
	
	function isRendered() {
		return (svg !== undefined);
	}
	that.isRendered = isRendered;
	
	function render(newValue) {
		svg = d3.select(container)
			.append('svg:svg')
				.attr('class', 'gauge')
				.attr('width', config.clipWidth)
				.attr('height', config.clipHeight);
		
		var centerTx = centerTranslation();
        
        // Add Arcs
		var arcsGrey = svg.append('g')
                .attr('class', 'arcGrey')
				.attr('transform', centerTx);
        
		arcsGrey.selectAll('path')
				.data(tickData)
			.enter().append('path')
				.attr('fill', config.arcColor)
                .attr('d', arcGrey);
                
        var arcsLightGreen = svg.append('g')
				.attr('class', 'arcLightGreen')
				.attr('transform', centerTx);
        
        arcsLightGreen.append('path')
				.attr('fill', config.secondArcColor)
                .attr('d', arcLightGreen);
                
        var arcsGreen = svg.append('g')
                .attr('class', 'arcGreen')
                .attr('transform', centerTx)
                .attr('y', 40 + "px");
        
        arcsGreen.append('path')
				.attr('fill', config.thirdArcColor)
				.attr('d', arcGreen);
        
        
        // Add Ticks
		var label_grey = svg.append('g')
				.attr('class', 'label_grey')
                .attr('transform', centerTx);
                
        label_grey.selectAll('text')
				.data([config.minValue, config.maxValue])
			.enter().append('text')
                .attr('x', function(d){
                    var radius = 180 - 180 / 100 * d;
                    radius = 3.14 / 180 * radius;
                    return Math.cos(radius) * (pointerHeadLength + 40);
                })
                .attr('y', function(d){
                    var radius = 180 - 180 / 100 * d;
                    radius = 3.14 / 180 * radius;
                    return - Math.sin(radius) * (pointerHeadLength + 2);
                })
                .text(function(d){
                    return d + config.labelFormat;
                });
              
        var label_lightgreen = svg.append('g')
				.attr('class', 'label_lightgreen')
                .attr('transform', centerTx);

        label_lightgreen.selectAll('text')
				.data([config.secondArcStart, config.secondArcEnd])
            .enter().append('text')
                .attr('class', function(d, i){
                    if (i == 0) return "start2";
                    else return "end2";
                })
                .attr('x', function(d){
                    var radius = 180 - 180 / 100 * d;
                    radius = 3.14 / 180 * radius;
                    return Math.cos(radius) * (pointerHeadLength + 40);
                })
                .attr('y', function(d){
                    var radius = 180 - 180 / 100 * d;
                    radius = 3.14 / 180 * radius;
                    return - Math.sin(radius) * (pointerHeadLength + 2);
                })
                .text(function(d){
                    return d + config.labelFormat;
                });
                
        var label_green = svg.append('g')
				.attr('class', 'label_green')
                .attr('transform', centerTx);

        label_green.selectAll('text')
				.data([config.thirdArcStart, config.thirdArcEnd])
            .enter().append('text')
                .attr('class', function(d, i){
                    if (i == 0) return "start3";
                    else return "end3";
                })
                .attr('x', function(d){
                    var radius = 180 - 180 / 100 * d;
                    radius = 3.14 / 180 * radius;
                    return Math.cos(radius) * (pointerHeadLength + 40);
                })
                .attr('y', function(d){
                    var radius = 180 - 180 / 100 * d;
                    radius = 3.14 / 180 * radius;
                    return - Math.sin(radius) * (pointerHeadLength + 2);
                })
                .text(function(d){
                    return d + config.labelFormat;
                });

        svg.append('g')
				.attr('class', 'total')
                .attr('transform', centerTx)
                .append('text')
                .attr('class', 'totalpoint')
                .attr('x', 20)
                .attr('y', 70)
                .text(50);
        d3.selectAll('.total')
                .append('text')
                .attr('class', 'totalpercent')
                .attr('x', 20)
                .attr('y', 70)
                .text(config.labelFormat);

                
		var lineData = [ [config.pointerWidth / 2, 0], 
						[0, -pointerHeadLength]];
		var pointerLine = d3.svg.line();
		var pg = svg.append('g').data([lineData])
                .attr('class', 'pointerNeedle')
                .style('stroke-width', 2)
				.attr('transform', centerTx);
		pointer = pg.append('path')
            .attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
            .style('fill', config.NeedleColor)
            .style('stroke', config.NeedleColor)
            .attr('transform', 'rotate(' + config.minAngle + ')');            

        var lineData1 = [ 
                [config.pointerWidth / 2 - 5, 30], 
                [config.pointerWidth / 2 - 5, -pointerHeadLength/10],
                [config.pointerWidth / 2 + 4, -pointerHeadLength/10],
                [config.pointerWidth / 2 + 4, 30],
            ];
        var pointerLine1 = d3.svg.line();
        var pg1 = svg.append('g').data([lineData1])
                .attr('class', 'pointerTail')
                .style('stroke-width', 1)
                .style('fill', config.NeedleColor)
                .style('stroke', config.NeedleColor)
                .attr('transform', centerTx);
        pointerTail = pg1.append('path')
                .attr('d', pointerLine1)
                .attr('transform', 'rotate(' +config.minAngle +')');

        pointerCircle = pg1.append("circle")
                .attr("class", "circle")
                .attr("r", 16)
                .attr("cx", config.pointerWidth / 2)
                .attr("cy", 0)
                .style("fill", "white")
                .style("stroke-width", 2)
                .attr('transform', 'rotate(' +config.minAngle +')');
			
		updatearcGrey(newValue === undefined ? 0 : newValue);
	}
	that.render = render;
	
	function updatearcGrey(newValue, newConfiguration) {
		if ( newConfiguration  !== undefined) {
			configure(newConfiguration);
		}
		var ratio = scale(newValue);
		var newAngle = config.minAngle + (ratio * range);
		pointer.transition()
			.duration(config.transitionMs)
			.ease('elastic')
            .attr('transform', 'rotate(' +newAngle +')');
        pointerTail.transition()
			.duration(config.transitionMs)
			.ease('elastic')
            .attr('transform', 'rotate(' +newAngle +')');
        pointerCircle.transition()
			.duration(config.transitionMs)
			.ease('elastic')
            .attr('transform', 'rotate(' +newAngle +')');
            
        d3.selectAll('.totalpoint')
            .text(Math.floor(newValue));
    }
    that.updatearcGrey = updatearcGrey;

    function updatearcLightGreen(startAngle, endAngle, percent){
        // Draw Light Green Arcs By start & end Angle
        d3.selectAll('.start2')
            .attr('x', function(d){
                var radius = 180 - 180 / 100 * startAngle;
                radius = 3.14 / 180 * radius;
                return Math.cos(radius) * (pointerHeadLength + 40);
            })
            .attr('y', function(d){
                var radius = 180 - 180 / 100 * startAngle;
                radius = 3.14 / 180 * radius;
                return - Math.sin(radius) * (pointerHeadLength + 2);
            })
            .text(Math.floor(startAngle) + config.labelFormat);

        d3.selectAll('.end2')
            .attr('x', function(d){
                var radius = 180 - 180 / 100 * endAngle;
                radius = 3.14 / 180 * radius;
                return Math.cos(radius) * (pointerHeadLength + 40);
            })
            .attr('y', function(d){
                var radius = 180 - 180 / 100 * endAngle;
                radius = 3.14 / 180 * radius;
                return - Math.sin(radius) * (pointerHeadLength + 2);
            })
            .text(Math.floor(endAngle) + config.labelFormat);

        var value = 50;
        var count = 0;
        function func() {
            
            var step1 = config.secondArcStart + (startAngle - config.secondArcStart) / value * (count + 1);
            var step2 = config.secondArcEnd + (endAngle - config.secondArcEnd) / value * (count + 1);
            
            arcLightGreen = d3.svg.arc()
                .innerRadius(r * 0.75)
                .outerRadius(r * 0.9)
                .startAngle(deg2rad(config.minAngle + 180 / 100 * step1))
                .endAngle(deg2rad(config.minAngle + 180 / 100 * step2));

            d3.selectAll('.arcLightGreen > path')
                .transition().duration(500 / value)
                .attr('d', arcLightGreen);
            count ++;

            if (count < value) setTimeout(func, 500 / value);
            else{
                config.secondArcStart = startAngle;
                config.secondArcEnd = endAngle;
                updatePointColor(percent);
            }
        }
        func();
    }
    that.updatearcLightGreen = updatearcLightGreen;
    
    function updatearcGreen(startAngle, endAngle, percent){
        // Draw Green Arcs By start & end Angle
        d3.selectAll('.start3')
        .attr('x', function(d){
            var radius = 180 - 180 / 100 * startAngle;
            radius = 3.14 / 180 * radius;
            return Math.cos(radius) * (pointerHeadLength + 40);
        })
        .attr('y', function(d){
            var radius = 180 - 180 / 100 * startAngle;
            radius = 3.14 / 180 * radius;
            return - Math.sin(radius) * (pointerHeadLength + 20);
        })
        .text(Math.floor(startAngle) + config.labelFormat);

        d3.selectAll('.end3')
            .attr('x', function(d){
                var radius = 180 - 180 / 100 * endAngle;
                radius = 3.14 / 180 * radius;
                return Math.cos(radius) * (pointerHeadLength + 40);
            })
            .attr('y', function(d){
                var radius = 180 - 180 / 100 * endAngle;
                radius = 3.14 / 180 * radius;
                return - Math.sin(radius) * (pointerHeadLength + 20);
            })
            .text(Math.floor(endAngle) + config.labelFormat);
            
        var value = 50;
        var count = 0;
        function func() {
            
            var step1 = config.thirdArcStart + (startAngle - config.thirdArcStart) / value * (count + 1);
            var step2 = config.thirdArcEnd + (endAngle - config.thirdArcEnd) / value * (count + 1);
            
            arcGreen = d3.svg.arc()
                .innerRadius(r * 0.75)
                .outerRadius(r * 0.9)
                .startAngle(deg2rad(config.minAngle + 180 / 100 * step1))
                .endAngle(deg2rad(config.minAngle + 180 / 100 * step2));

            d3.selectAll('.arcGreen > path')
                .transition().duration(500 / value)
                .attr('d', arcGreen);
            count ++;

            if (count < value) setTimeout(func, 500 / value);
            else{
                config.thirdArcStart = startAngle;
                config.thirdArcEnd = endAngle;
                updatePointColor(percent);
            }
        }
        func();
    }
    that.updatearcGreen = updatearcGreen;
    
    function updatePointColor(percent){
        if ((percent >= config.thirdArcStart) && (percent <= config.thirdArcEnd)){
            pointerCircle.style("fill", config.thirdArcColor);
        }else if ((percent >= config.secondArcStart) && (percent < config.thirdArcStart)){
            pointerCircle.style("fill", config.secondArcColor);
        }else if ((percent > config.thirdArcEnd) && (percent <= config.secondArcEnd)){
            pointerCircle.style("fill", config.secondArcColor);
        }else{
            pointerCircle.style("fill", config.arcColor);
        }
    }
    that.updatePointColor = updatePointColor;

	configure(configuration);
	
	return that;
};

var powerGauge = gauge('.gauge', {
    size: 300,
    clipWidth: 300,
    clipHeight: 300,
    ringWidth: 60,
    maxValue: 100,
    transitionMs: 1500,
});
powerGauge.render();

function updateGauge() {
    // just pump in random data here...
    var randomValue = Math.random() * 100;
    // randomValue = 0;
    randomValue = Math.floor(randomValue);
    powerGauge.updatearcGrey(randomValue);

    var startAngle2 = 10 + Math.random() * 20;
    var endAngle2 = 70 + Math.random() * 20;
    powerGauge.updatearcLightGreen(startAngle2, endAngle2, randomValue);

    var startAngle3 = 35 + Math.random() * 10;
    var endAngle3 = 50 + Math.random() * 15;
    powerGauge.updatearcGreen(startAngle3, endAngle3, randomValue);

    if (prevGaugePoint > randomValue){        
        document.getElementById("gaugesymbol").classList.remove('glyphicon-triangle-bottom');
        document.getElementById("gaugesymbol").classList.remove('glyphicon-triangle-top');
        document.getElementById("gaugesymbol").classList.add('glyphicon-triangle-bottom');
        document.getElementById("gaugecompareid").classList.remove('red');
        document.getElementById("gaugecompareid").classList.remove('green');
        document.getElementById("gaugecompareid").classList.add('red');
        document.getElementById("gaugecomparetext").innerText = (prevGaugePoint - randomValue) + "%";
    }else if(prevGaugePoint < randomValue){
        document.getElementById("gaugesymbol").classList.remove('glyphicon-triangle-bottom');
        document.getElementById("gaugesymbol").classList.remove('glyphicon-triangle-top');
        document.getElementById("gaugesymbol").classList.add('glyphicon-triangle-top');
        document.getElementById("gaugecompareid").classList.remove('red');
        document.getElementById("gaugecompareid").classList.remove('green');
        document.getElementById("gaugecompareid").classList.add('green');
        document.getElementById("gaugecomparetext").innerText = (randomValue - prevGaugePoint) + "%";
    }
    prevGaugePoint = randomValue;
}

// every few seconds update reading values
updateGauge();
// setInterval(function() {
//     updateGauge();
// }, 3 * 1000);