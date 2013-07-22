var width = 900, 
    height = 600,
    minMagn = 5.0,
    rightSpace = 7, // curve passes width boundary
    topTxt = null,
    bottomTxt = null,
    topVis,
    bottomVis,
    mult = (10 - minMagn)*(minMagn*3),
    values = [],
    spinner,
    count,
    gData,
    spacing,
    limit = 100,//20000,
    startDate = '1970-01-01', //'2009-01-01',
    endDate = 'NOW',//'2010-01-01T00%3A00%3A00',
    time = '';//starttime=' + startDate + 'T00%3A00%3A00&endtime=' + endDate + '&,

//&orderby=time-desc

function startVis(){
    startSpin();
    
    var url = encodeURIComponent('http://comcat.cr.usgs.gov/fdsnws/event/1/query?' + time + 'minmagnitude=' + minMagn + '&limit='  + limit + '&format=geojson');
    
    //var geojson;
    $.getJSON('proxy.php?url=' + url, function(data){
        gData = data;
        count = data.features.length;
        spacing = width/count;
        createSVG(data);
        console.log(data.features.length);
        
        
        //createVis(data); 
    });


}



function createSVG(data){
    //if(Raphael.svg){
        var i = 0,
            pathTop = '',
            pathBottom = '',
            currentX = 0,
            currentY1 = height/2,
            currentY2 = height/2,
            magnMult;
            //d = new Date();
        
        $.each(data.features.reverse(), function(index){
            var magn = data.features[index].properties.mag;
            magnMult = Math.round((magn - (minMagn - 1))*mult);
            values.push(magn.toFixed(1));
                
            if(i){
                currentX += spacing;
                
                currentY1 = height/2 - magnMult;
                pathTop += ',' + [currentX, currentY1];
                
                currentY2 = height/2 + magnMult;
                pathBottom += ',' + [currentX, currentY2];
            } else if(i == 0){
                pathTop += 'M' + [currentX, height/2 - magnMult] + 'R';
                pathBottom += 'M' + [currentX, height/2 + magnMult] + 'R';
            } else {
                pathTop += 'M' + [spacing, height/2 - magnMult] + 'R';
                pathBottom += 'M' + [spacing, height/2 + magnMult] + 'R';
            }
            
            i++;
                   
            //console.log(d.getTime() - data.features[index].properties.time);
           
        });

        
    
        if(i){
            currentX += spacing - rightSpace;
            
            currentY1 = height/2 - magnMult;
            pathTop += ',' + [currentX, currentY1];
            
            currentY2 = height/2 + magnMult;
            pathBottom += ',' + [currentX, currentY2];
        } else {
            pathTop += 'M' + [spacing - rightSpace, height/2 - magnMult] + 'R';
            pathBottom += 'M' + [spacing - rightSpace, height/2 + magnMult] + 'R';
        }
        
        spinner.stop();
        var svg = Raphael('svgTarget', width, height);
        drawTop(svg, pathTop);
        addTopHandler(svg);
        drawBottom(svg, pathBottom);
        addBottomHandler(svg);
        
        
        
        
        // draw line
       // svg.path('M0,' + height/2 + ' L' + width + ',' + height/2).attr({stroke: 'black', 'stroke-width': 2, opacity: 1.0});
        
        
        
    //} else {
       // alert('Your browser does not support SVG. Try using Google Chrome.');
    //}
}

function drawTop(svg, pathTop){
    // top
    //svg.path(pathTop).attr({fill: 'none', stroke: 'red', 'stroke-width': 4, 'stroke-linecap': 'round'});
    topVis = svg.path(pathTop + 'L' + (width - rightSpace) + ',' + height/2 + 'L0,' + height/2 + 'Z').attr({fill: 'red', stroke: 'red'});
    
    
        
}

function addTopHandler(svg){
    topVis.mousemove(function(e){
            var xOffset = getOffset(document.getElementById('svgTarget')).left,
                yOffset = getOffset(document.getElementById('svgTarget')).top,
                mouseX = e.pageX - document.body.scrollLeft,
                mouseY = e.pageY - document.body.scrollTop,
                x = mouseX - xOffset,
                y = mouseY - yOffset - 20,
                text;
        
            for(var i = 0; i < count; i++){
                if(x >= (spacing*i - spacing/4) && x <= (spacing*(i+1) - spacing/4)){
                    text = values[i] + ' Magnitude';
                    break;
                }
            
            }
                   
            if(topTxt === null){
                topTxt = svg.text(x, y, text).attr({'font-size': 20});
            } else {
                topTxt.attr({text: text, x: x, y: y, 'font-size': 20}); 
            }
            
            
        
        });
    
    topVis.mouseout(function(e){
       topTxt.attr({text: ''}); 
    });
}

function drawBottom(svg, pathBottom){
    // bottom
    //svg.path(pathBottom).attr({fill: 'none', stroke: 'red', 'stroke-width': 4, 'stroke-linecap': 'round'});
   bottomVis = svg.path(pathBottom + 'L' + (width - rightSpace) + ',' + height/2 + 'L0,' + height/2 + 'Z').attr({fill: 'red', stroke: 'red'});
    
    
}

function addBottomHandler(svg){
    bottomVis.mousemove(function(e){
            var xOffset = getOffset(document.getElementById('svgTarget')).left,
                yOffset = getOffset(document.getElementById('svgTarget')).top,
                mouseX = e.pageX - document.body.scrollLeft,
                mouseY = e.pageY - document.body.scrollTop,
                x = mouseX - xOffset,
                y = mouseY - yOffset - 20,
                text;
        
            for(var i = 0; i < count; i++){
                if(x >= (spacing*i - spacing/4) && x <= (spacing*(i+1) - spacing/4)){
                    text = values[i] + ' Magnitude';
                    break;
                }
            
            }
                   
            if(bottomTxt === null){
                bottomTxt = svg.text(x, y, text).attr({'font-size': 20});
            } else {
                bottomTxt.attr({text: text, x: x, y: y, 'font-size': 20}); 
            }
            
            
        
        });
    
    bottomVis.mouseout(function(e){
       bottomTxt.attr({text: ''}); 
    });
}

function startSpin(){
    var opts = {
      lines: 13, // The number of lines to draw
      length: 20, // The length of each line
      width: 10, // The line thickness
      radius: 30, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000', // #rgb or #rrggbb
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: 'auto', // Top position relative to parent in px
      left: 'auto' // Left position relative to parent in px
    },
        target = document.getElementById('svgTarget');
    spinner = new Spinner(opts).spin(target);
}

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}



/*function createVis(data){
    var canvas = document.getElementById("canvas"),
        ctx = canvas.getContext("2d"),
        vMiddle = canvas.height/2,
        eXSize = canvas.width/count,
        
        sign = -1,
        currentX = -1;
        //currentY = vMiddle;
    
    
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    //ctx.moveTo(currentX, vMiddle);
    //ctx.lineTo(canvas.width, vMiddle);
    //ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(currentX, vMiddle);
        
    
    for(var i = 0; i < 2; i++){
        currentX = 0;
        sign *= -1;
        ctx.lineTo(currentX, vMiddle);
        
        $.each(data.features, function(index){
            
            if(index < (count - 1)){
                var magnMult1 = data.features[index].properties.mag - minMagn,
                    magnMult2 = data.features[(index + 1)].properties.mag - minMagn;
                
                //ctx.arc(currentX + eXSize/2, currentY - magnMult1*3, eXSize/2, Math.PI, 2*Math.PI);
                //ctx.quadraticCurveTo(currentX + eXSize/2, currentY - magnMult1*3, currentX + eXSize, currentY - magnMult2*2);
                
                ctx.lineTo(currentX + eXSize/2, vMiddle - magnMult1*mult*sign);
                ctx.lineTo(currentX + eXSize, vMiddle - magnMult2*mult*sign);
                
                ctx.stroke();
                currentX += eXSize;
                console.log(magnMult1);
            } else {
                var magnMult1 = data.features[index].properties.mag - minMagn;
                ctx.lineTo(currentX + eXSize/2, vMiddle - magnMult1*mult*sign);
                ctx.lineTo(currentX + eXSize, vMiddle);
                
                ctx.stroke();
                
                currentX += eXSize;
                console.log(magnMult1);
            }
            
           
        });
        
        ctx.strokeStyle = 'blue';
        ctx.fillStyle = 'blue';
        ctx.fill();
        
        ctx.closePath();
        
    }
    
    
    
    
}*/