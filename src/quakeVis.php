<!DOCTYPE html>
<html>
    
    <head>
        <meta charset="UTF-8">
        <title>Erik Paluka - Earthquake Visualization</title>
        <meta name="description" content="Visualization of Past Earthquakes">
        <meta itemprop="description" content="Erik specializes in human-computer interaction and is currently working on his master's degree in computer science at the University of Ontario Institute of Technology.">
        <meta name="keywords" content="human computer interaction, computer science">
        <meta itemprop="image" content="http://www.erikpaluka.com/images/erik2.jpg">
        <link REL="SHORTCUT ICON" href="http://www.erikpaluka.com/images/taz.ico">
        <link rel="stylesheet" type="text/css" href="../../style.css" />
        <link rel="stylesheet" type="text/css" href="plugins/datepicker/datepicker.css" />
        <link rel="stylesheet" type="text/css" href="plugins/slider/luna.css" />
        <script src="plugins/jquery-1.7.2.min.js"></script>
        <script src="quakeScript.js"></script>
        <script src="plugins/raphael-min.js"></script>
        <script src="plugins/spin.min.js"></script>
        
        <script src="plugins/datepicker/datepicker.js"></script>
        
        <script src="plugins/slider/range.js"></script>
        <script src="plugins/slider/slider.js"></script>
        <script src="plugins/slider/timer.js"></script>
        <style>
            .slider {
                margin-left: 350px;
            }
            
            #begDate {
                width: 80px;
            }
                
            #endDate {
                width: 80px;
            }
            
            #maxResults {
                width: 30px;
            }
        </style>
    </head>
    
    <body onload="setup();">
        <div class="container">
            <?php include( '../../includes/header.php'); ?>
            <div style="height: 200px"></div>
            <div style="text-align: center">
                
                <h3>QuakeVis: Visualization of Past Earthquakes on Earth</h3>
                Using real-time data from the
                <a href="http://earthquake.usgs.gov/earthquakes/feed/" target="_blank">United States Geological Survey (USGS)</a> agency
                <br>
                <br>
                <br>Choose Minimum Date
                <input id='begDate' type='text' value='' />
                Choose Maximum Date
                <input id='endDate' type='text' value='' />
                <br><br>
                Choose the Maximum Number of Results
                <input id='maxResults' type='text' value='100' />
                <br><br>
                <div>
                    <span>Choose Minimum Magnitude:</span>
                    <span id="minMag">5.0</span>
                    <div class="slider" id="slider-1" tabIndex="1">
                        <input class="slider-input" id="slider-input-1" name="slider-input-1">
                    </div>
                </div>
                <br>
                <div>
                    <span>Choose Maximum Magnitude:</span>
                    <span id="maxMag">10.0</span>
                    <div class="slider" id="slider-2" tabIndex="1">
                        <input class="slider-input" id="slider-input-2" name="slider-input-2">
                    </div>
                </div>
                <br>
                <table style='text-align: center; margin: auto;'>
                    <tr>
                        <td style='padding-left:130px;'>
                            <div class='button'>Get Data</div>
                        </td>
                    </tr>
                </table>
                <br>
                <div id="svgTarget" style="height:600px; border-style: solid;
border-width:3px;"></div>
            
            </div>
            <?php include( '../../includes/footer.php'); ?>
        </div>
    </body>

</html>