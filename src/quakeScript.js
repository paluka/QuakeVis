var width = 900,
    height = 600,
    minMagn,
    maxMagn,
    rightSpace = 7, // curve passes width boundary
    popUpTxt = null,
    popUpRect = null,
    topVis,
    bottomVis,
    mult,
    values,
    pathVis = [],
    numSvgs = 0,
    sOpacity = 0.5,
    spinner,
    count,
    gData,
    svg,
    started = false,
    spacing,
    limit,// = 100, //20000,
    startDate = '', //'1970-01-01', //'2009-01-01',
    endDate = '', //'NOW',//'2010-01-01T00%3A00%3A00',
    time = 'T00%3A00%3A00';
//starttime=' + startDate + 'T00%3A00%3A00&endtime=' + endDate + '&,

//&orderby=time-desc

function checkDates(bd, ed) {
    //alert(ed + ' ' + bd + ' ' + (ed >bd));
    if (ed > bd) {
        return true;
    } else {
        alert("Maximum date must be larger than minimum date.");
        console.log(ed);
        console.log(bd);
        return false;
    }

    return false;
}

function createSliders() {
    var minSlider = new Slider(document.getElementById("slider-1"),
        document.getElementById("slider-input-1")),
        maxSlider = new Slider(document.getElementById("slider-2"),
            document.getElementById("slider-input-2"));

    minSlider.setMinimum(1);
    minSlider.setMaximum(100);
    minSlider.setValue(document.getElementById("minMag").innerHTML * 10);
    minSlider.onchange = function () {
        if (minSlider.getValue() <= maxSlider.getValue()) {
            var mag = (minSlider.getValue() / 10).toFixed(1);

            document.getElementById("minMag").innerHTML = mag;
            minMagn = mag;
        } else {
            minSlider.setValue(minSlider.getValue() - 1);
        }
    };

    maxSlider.setMinimum(1);
    maxSlider.setMaximum(100);
    maxSlider.setValue(document.getElementById("maxMag").innerHTML * 10);
    maxSlider.onchange = function () {
        if (minSlider.getValue() <= maxSlider.getValue()) {
            var mag = (maxSlider.getValue() / 10).toFixed(1);

            document.getElementById("maxMag").innerHTML = mag;
            maxMagn = mag;
        } else {
            maxSlider.setValue(maxSlider.getValue() + 1);
        }
    };

    minMagn = document.getElementById("minMag").innerHTML;
    maxMagn = document.getElementById("maxMag").innerHTML;
}

function setup() {
    createSliders();
    var currentDate = new Date(),
        defEndDate = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate(),
        tempDate = (currentDate.getFullYear() - 1) + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate();


    $('#begDate').val(tempDate);
    startDate = 'starttime=' + tempDate + time + '&';

    $('#begDate').DatePicker({
        date: tempDate,
        current: tempDate,
        onChange: function (formated, dates) {


            var bd = new Date();
            bd.setFullYear(formated.substr(0, 4));
            bd.setMonth((parseInt(formated.substr(5, 2)) - 1), formated.substr(8, 2));

            var ed = new Date();

            if (endDate != '') {
                ed.setFullYear($('#endDate').val().substr(0, 4));
                ed.setMonth((parseInt($('#endDate').val().substr(5, 2)) - 1));
                ed.setDate($('#endDate').val().substr(8, 2));
            }

            if (checkDates(bd, ed)) {
                $('#begDate').val(formated);
                startDate = 'starttime=' + formated + time + '&';
            }
        }
    });

    $('#endDate').DatePicker({
        date: defEndDate,
        current: defEndDate,
        onChange: function (formated, dates) {


            var ed = new Date();
            ed.setFullYear(formated.substr(0, 4));
            ed.setMonth((parseInt(formated.substr(5, 2)) - 1), formated.substr(8, 2));

            var bd = new Date();
            bd.setFullYear($('#begDate').val().substr(0, 4));
            bd.setMonth((parseInt($('#begDate').val().substr(5, 2)) - 1));
            bd.setDate($('#begDate').val().substr(8, 2));
           
            if (checkDates(bd, ed)) {
                $('#endDate').val(formated);
                endDate = 'endtime=' + formated + time + '&';
            }
        }
    });


    $('.button').click(function () {

        if ($('#begDate').val() != '') {
            startDate = 'starttime=' + $('#begDate').val() + time + '&';
        }

        if ($('#endDate').val() != '') {
            endDate = 'endtime=' + $('#endDate').val() + time + '&';
        }
        startVis();
    });

    svg = Raphael('svgTarget', width, height);
    topVis = svg.path("M0,0").attr({
        fill: 'red',
        stroke: 'red',
        'stroke-width': 4,
        'stroke-linecap': 'round'
    });
    bottomVis = svg.path("M0,0").attr({
        fill: 'red',
        stroke: 'red',
        'stroke-width': 4,
        'stroke-linecap': 'round'
    });

    
    startVis();

}


function startVis() {
    startSpin();
    limit = Math.min(document.getElementById("maxResults").value, 1000);
    var url = encodeURIComponent('http://comcat.cr.usgs.gov/fdsnws/event/1/query?' + startDate + endDate + 'minmagnitude=' + minMagn + '&maxmagnitude=' + maxMagn + '&limit=' + limit + '&format=geojson');

    $.getJSON('proxy.php?url=' + url, function (data) {
        gData = data;
        count = data.features.length;
        if (count > 0) {
            spacing = width / count;
            createSVG(data);
            console.log('Number of results: ' + data.features.length);
        } else {
            alert('Your requested query has zero results. Change the options and try again.');
            spinner.stop();
        }

    });


}



function createSVG(data) {
    if(Raphael.svg){
        var i = 0,
            pathTop = '',
            pathBottom = '',
            currentX = 0,
            currentY1 = height / 2,
            currentY2 = height / 2,
            magnMult,
            mult = 80; //(10 - minMagn)*(15);
        
        
    
        values = [];
    
    
        $.each(data.features.reverse(), function (index) {
            var magn = data.features[index].properties.mag,
                place = data.features[index].properties.place,
                time = data.features[index].properties.time;
            
            if (minMagn < 1) {
                magnMult = Math.round((magn - minMagn) * mult);
            } else {
                magnMult = Math.round((magn - (minMagn - 1)) * mult);
            }
            
            
            
            values.push({mag: magn.toFixed(1), loc: place, date: time});
    
            if (i) {
                currentX += spacing;
    
                currentY1 = height / 2 - magnMult;
                pathTop += ',' + [currentX, currentY1];
    
                currentY2 = height / 2 + magnMult;
                pathBottom += ',' + [currentX, currentY2];
            } else if (i == 0) {
                pathTop += 'M' + [currentX, height / 2 - magnMult] + 'R';
                pathBottom += 'M' + [currentX, height / 2 + magnMult] + 'R';
            }
    
            i++;
    
    
    
        });
    
    
    
        if (i) {
            currentX += spacing - rightSpace;
    
            currentY1 = height / 2 - magnMult;
            pathTop += ',' + [currentX, currentY1];
    
            currentY2 = height / 2 + magnMult;
            pathBottom += ',' + [currentX, currentY2];
        } else {
            pathTop += 'M' + [spacing - rightSpace, height / 2 - magnMult] + 'R';
            pathBottom += 'M' + [spacing - rightSpace, height / 2 + magnMult] + 'R';
        }
    
        spinner.stop();
    
        drawTop(pathTop);
        drawBottom(pathBottom);
        drawSegments(pathTop, pathBottom);
        started = true;
        numSvgs++;
    



    } else {
        alert('Your browser does not support SVG. Try using Google Chrome.');
    }
}

function drawSegments(pathTop, pathBottom) {
    var pathSegTop = Raphael.parsePathString(pathTop);
    var pathSegBottom = Raphael.parsePathString(pathBottom);
    var i, index = 0, path = [];
   
    
    if (started) {
        for (i = 0; i < pathVis.length; i++) { 
            pathVis[i].unmousemove(pathVis[i].mMoveHandler);
            pathVis[i].unmouseout(pathVis[i].mOutHandler);
            pathVis[i].untouchmove(pathVis[i].mMoveHandler);
            pathVis[i].untouchend(pathVis[i].mOutHandler);
            pathVis[i].untouchcancel(pathVis[i].mOutHandler);
            pathVis[i].attr({'fill-opacity': 0, 'stroke-opacity': 0});
            
            
        }
        
        popUpRect.remove();
        popUpTxt.remove();
        popUpTxt = null;
    }
    
    
    for(i = 0; i < pathSegTop[1].length; i = i + 4){
        if(i == 0){
            path[index] = 'M' + [pathSegBottom[0][1], pathSegBottom[0][2]] + ',L' + [pathSegTop[0][1], pathSegTop[0][2]] + 'R' + ',' + [pathSegTop[1][1], pathSegTop[1][2]] + ',' + [pathSegTop[1][3], pathSegTop[1][4]];
            
            
            
            path[index] += ',M' + [pathSegBottom[0][1], pathSegBottom[0][2]] + 'R,' + [pathSegBottom[1][1], pathSegBottom[1][2]] + ',' + [pathSegBottom[1][3], pathSegBottom[1][4]] + ',L' + [pathSegTop[1][3], pathSegTop[1][4]] + 'Z';
           
            } else {
                path[index] =  'M' + [pathSegBottom[1][i - 1], pathSegBottom[1][i]] + ',L' + [pathSegTop[1][i - 1], pathSegTop[1][i]] + 'R,' + [pathSegTop[1][i + 1], pathSegTop[1][i + 2]] + ',' + [pathSegTop[1][i + 3], pathSegTop[1][i + 4]];
            
            
            
            path[index] += ',M' + [pathSegBottom[1][i - 1], pathSegBottom[1][i]] + 'R,' + [pathSegBottom[1][i + 1], pathSegBottom[1][i + 2]] + ',' + [pathSegBottom[1][i + 3], pathSegBottom[1][i + 4]] + ',L' + [pathSegTop[1][i + 3], pathSegTop[1][i + 4]] + 'Z';
        } 
        
        
        
        
        
        pathVis[index] = svg.path("M0,0").attr({
            fill: 'red',
            'stroke-width': 1,
            'stroke-linecap': 'round',
            stroke: 'red',
            'fill-opacity': 0,
            'stroke-opacity': 0
        });
        
        pathVis[index].attr({
            path: path[index]
            
        });
                
        
        pathVis[index].mMoveHandler = function(e) {
            this.attr({'fill-opacity': 1, 'stroke-opacity': 1});
            
            
            var xOffset = getOffset(document.getElementById('svgTarget')).left,
                yOffset = getOffset(document.getElementById('svgTarget')).top,
                mouseX = e.pageX - document.body.scrollLeft,
                mouseY = e.pageY - document.body.scrollTop,
                x = mouseX - xOffset,
                y = mouseY - yOffset,
                text = '',
                i;
                

            for (i = 0; i < count; i++) {
                if (x >= (spacing * i - spacing/4) && x < (spacing * (i + 1) - spacing/4)) {
                    var quakeDate = new Date();
                    quakeDate.setTime(values[i].date);
                    
                    text = values[i].mag + ' Magnitude\n' +
                           values[i].loc + '\n' +
                           quakeDate.toDateString();
                    break;
                }
        
            }
            
                
    
            var rectOffsetX = 10,
                rectOffsetY = 10;
            
            if (popUpTxt === null) {
                popUpTxt = svg.text(x, y, text).attr({
                    'font-size': 20
                    
                });
                
               
                popUpRect = svg.rect(x, y, 0, 0, 10);
            } else {

                popUpTxt.attr({
                    text: text,
                    x: x,
                    y: y,
                });
                
                
            }
            
            var bbox = popUpTxt.getBBox(false);
            //x += bbox.width/2 + rectOffsetX*4;
            
            if (x > width - bbox.width/2 - rectOffsetX*4) {
                x -= (bbox.width/2 + rectOffsetX*4);   
            } else if (x < bbox.width/2 + rectOffsetX*4){
                x += (bbox.width/2 + rectOffsetX*4);  
            }
            
            y += bbox.height*2;
            
            if(y > height - bbox.height - rectOffsetY){
             y -= bbox.height*4;   
            }
            
            popUpTxt.attr({
                x: x,
                y: y,
            });
            
            if(text == ''){
                popUpRect.attr({width: 0, height: 0, fill: 'none', stroke: 'none'});
            } else {
                popUpRect.attr({x: x - bbox.width/2 - rectOffsetX, y: y - bbox.height/2 - rectOffsetY, width: bbox.width + rectOffsetX*2, height: bbox.height + rectOffsetY*2, fill: '#C1F0F6', 'fill-opacity': 0.5, stroke: '#C1F0F6', 'stroke-opacity': 1, 'stroke-width': 5});
            }
    
            popUpRect.toFront();
            popUpTxt.toFront();
        };
        
        pathVis[index].mOutHandler = function mouseOutHandler(e) {
            this.attr({'fill-opacity': 0, 'stroke-opacity': 0});
                        
            popUpTxt.attr({
                text: ''
            });
            
            popUpRect.attr({width: 0, height: 0, fill: 'none', stroke: 'none'});
        };
        
        
        pathVis[index].mousemove(pathVis[index].mMoveHandler);        
        pathVis[index].mouseout(pathVis[index].mOutHandler);
        pathVis[index].touchmove(pathVis[index].mMoveHandler);        
        pathVis[index].touchend(pathVis[index].mOutHandler);
        pathVis[index].touchcancel(pathVis[index].mOutHandler);
        
        index++;
        
    }
    
 
    
}

function drawTop(pathTop) {
    pathTop += 'L' + (width - rightSpace) + ',' + height / 2 + 'L0,' + height / 2 + 'Z';


    if (started) {
        var time = 500;
        var eAnim = Raphael.animation({
            path: pathTop,
            fill: 'red',
            stroke: 'red',
            'fill-opacity': sOpacity,
            'stroke-opacity': 0
        }, time, '<>');
        topVis.animate(eAnim);

    } else {
        topVis.attr({
            path: pathTop,
            'fill-opacity': sOpacity,
            'stroke-opacity': 0
        });
    }


}

function drawBottom(pathBottom) {

    pathBottom += 'L' + (width - rightSpace) + ',' + height / 2 + 'L0,' + height / 2 + 'Z';

    if (started) {
        var time = 500;
        var eAnim = Raphael.animation({
            path: pathBottom,
            fill: 'red',
            stroke: 'red',
            'fill-opacity': sOpacity,
            'stroke-opacity': 0
        }, time, '<>');
        bottomVis.animate(eAnim);

    } else {
        bottomVis.attr({
            path: pathBottom,
            'fill-opacity': sOpacity,
            'stroke-opacity': 0
        });
    }

}

function startSpin() {
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

function getOffset(el) {
    var _x = 0;
    var _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return {
        top: _y,
        left: _x
    };
}