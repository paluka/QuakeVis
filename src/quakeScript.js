var width = 900,
    height = 600,
    minMagn,
    maxMagn,
    rightSpace = 7, // curve passes width boundary
    topTxt = null,
    bottomTxt = null,
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

    minSlider.setMinimum(0);
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

    maxSlider.setMinimum(0);
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
            /*if (startDate == '') {
                bd.setFullYear(bd.getFullYear() - 1);
                console.log(bd);
            } else {*/
            
                bd.setFullYear($('#begDate').val().substr(0, 4));
                bd.setMonth((parseInt($('#begDate').val().substr(5, 2)) - 1));
                bd.setDate($('#begDate').val().substr(8, 2));
           // }
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
            console.log(data.features.length);
        } else {
            alert('Your requested query has zero results. Change the options and try again.');
            spinner.stop();
        }

    });


}



function createSVG(data) {
    //if(Raphael.svg){
    var i = 0,
        pathTop = '',
        pathBottom = '',
        currentX = 0,
        currentY1 = height / 2,
        currentY2 = height / 2,
        magnMult,
        mult = (10 - minMagn)*(minMagn*3);

    values = [];


    $.each(data.features.reverse(), function (index) {
        var magn = data.features[index].properties.mag;
        magnMult = Math.round((magn - (minMagn - 1)) * mult);
        values.push(magn.toFixed(1));
        console.log(magn.toFixed(1));
        if (i) {
            currentX += spacing;

            currentY1 = height / 2 - magnMult;
            pathTop += ',' + [currentX, currentY1];

            currentY2 = height / 2 + magnMult;
            pathBottom += ',' + [currentX, currentY2];
        } else if (i == 0) {
            pathTop += 'M' + [currentX, height / 2 - magnMult] + 'R';
            pathBottom += 'M' + [currentX, height / 2 + magnMult] + 'R';
        }/* else {
            console.log("a");
            pathTop += 'M' + [spacing, height / 2 - magnMult] + 'R';
            pathBottom += 'M' + [spacing, height / 2 + magnMult] + 'R';
        }*/

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
    //addTopHandler();
    drawBottom(pathBottom);
    //addBottomHandler();
    drawSegments(pathTop, pathBottom);
    started = true;
    numSvgs++;
    
    // draw line
    // svg.path('M0,' + height/2 + ' L' + width + ',' + height/2).attr({stroke: 'black', 'stroke-width': 2, opacity: 1.0});



    //} else {
    // alert('Your browser does not support SVG. Try using Google Chrome.');
    //}
}

function drawSegments(pathTop, pathBottom){
    var pathSegTop = Raphael.parsePathString(pathTop);
    var pathSegBottom = Raphael.parsePathString(pathBottom);
    var i, index = 0, path = [];
   
    
    if(started){
        for(i = 0; i < pathVis.length; i++){ 
            pathVis[i].unmousemove(pathVis[i].mMoveHandler);
            pathVis[i].unmouseout(pathVis[i].mOutHandler);
            
        }
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
            //this.toFront();
            this.attr({'fill-opacity': 1, 'stroke-opacity': 1});
            //pathVis[tempI].show();
            
            
            var xOffset = getOffset(document.getElementById('svgTarget')).left,
                yOffset = getOffset(document.getElementById('svgTarget')).top,
                mouseX = e.pageX - document.body.scrollLeft,
                mouseY = e.pageY - document.body.scrollTop,
                x = mouseX - xOffset,
                y = mouseY - yOffset - 50,
                text = '',
                i,
                xPos = x,
                yPos = y;

            for (i = 0; i < count; i++) {
                if (x >= (spacing * i - spacing/4) && x < (spacing * (i + 1) - spacing/4)) {
                    text = values[i] + '\n Magnitude';
                    break;
                }
        
            }
            
            var ocOffset = 40;
            
            if(x < ocOffset){
             xPos = x + ocOffset;   
            } else if(x > width - ocOffset){
             xPos = x - ocOffset;
                
            }
                
            if(y < ocOffset){
             yPos = y + ocOffset*3;   
            }
            
    
            if (topTxt === null) {
                topTxt = svg.text(xPos, yPos, text).attr({
                    'font-size': 20
                    
                });
            } else {
                topTxt.attr({
                    text: text,
                    x: xPos,
                    y: yPos,
                });
            }
    
            topTxt.toFront();
        };
        
        pathVis[index].mOutHandler = function mouseOutHandler(e) {
            this.attr({'fill-opacity': 0, 'stroke-opacity': 0});
                        
            topTxt.attr({
                text: ''
            });
        };
        
        
        pathVis[index].mousemove(pathVis[index].mMoveHandler);        
        pathVis[index].mouseout(pathVis[index].mOutHandler);
        
        index++;
        
    }
    
 
    
}

function drawTop(pathTop) {
    
    //svg.path(pathTop).attr({fill: 'none', stroke: 'red', 'stroke-width': 4, 'stroke-linecap': 'round'});
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

function addTopHandler() {
    topVis.mousemove(function (e) {
        var xOffset = getOffset(document.getElementById('svgTarget')).left,
            yOffset = getOffset(document.getElementById('svgTarget')).top,
            mouseX = e.pageX - document.body.scrollLeft,
            mouseY = e.pageY - document.body.scrollTop,
            x = mouseX - xOffset,
            y = mouseY - yOffset - 20,
            text,
            i;

        for (i = 0; i < count; i++) {
            if (x >= (spacing * i - spacing / 4) && x <= (spacing * (i + 1) - spacing / 4)) {
                text = values[i] + ' Magnitude';
                break;
            }

        }

        if (topTxt === null) {
            topTxt = svg.text(x, y, text).attr({
                'font-size': 20
                
            });
        } else {
            topTxt.attr({
                text: text,
                x: x,
                y: y,
                //'font-size': 20
            });
        }

        topTxt.toFront();
        

    });

    topVis.mouseout(function (e) {
        topTxt.attr({
            text: ''
        });
    });
}

function drawBottom(pathBottom) {
    // bottom
    //svg.path(pathBottom).attr({fill: 'none', stroke: 'red', 'stroke-width': 4, 'stroke-linecap': 'round'});

    pathBottom += 'L' + (width - rightSpace) + ',' + height / 2 + 'L0,' + height / 2 + 'Z'

    //bottomVis = svg.path(pathBottom ).attr({fill: 'red', stroke: 'red'});


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

function addBottomHandler() {
    bottomVis.mousemove(function (e) {
        var xOffset = getOffset(document.getElementById('svgTarget')).left,
            yOffset = getOffset(document.getElementById('svgTarget')).top,
            mouseX = e.pageX - document.body.scrollLeft,
            mouseY = e.pageY - document.body.scrollTop,
            x = mouseX - xOffset,
            y = mouseY - yOffset - 20,
            text;

        for (var i = 0; i < count; i++) {
            if (x >= (spacing * i - spacing / 4) && x <= (spacing * (i + 1) - spacing / 4)) {
                text = values[i] + ' Magnitude';
                break;
            }

        }

        if (bottomTxt === null) {
            bottomTxt = svg.text(x, y, text).attr({
                'font-size': 20
            });
        } else {
            bottomTxt.attr({
                text: text,
                x: x,
                y: y,
                'font-size': 20
            });
        }



    });

    bottomVis.mouseout(function (e) {
        bottomTxt.attr({
            text: ''
        });
    });
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