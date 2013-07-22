<!DOCTYPE html>
<html>
<head>
        <meta charset="UTF-8">
        <title>Erik Paluka - Earthquake Visualization</title>
        <meta name="description" content="Visualization of Past Earthquakes">
        <meta itemprop="description" content="Erik specializes in human-computer interaction and is currently working on his master's degree in computer science at the University of Ontario Institute of Technology.">
        <meta name="keywords" content="human computer interaction, computer science" >
        <meta itemprop="image" content="http://www.erikpaluka.com/images/erik2.jpg">
        <link REL="SHORTCUT ICON" HREF="http://www.erikpaluka.com/images/taz.ico">
        <link rel="stylesheet" type="text/css" href="../../style.css"/>
      		
        
        <script src="jquery-1.10.2.min.js"></script>
        <script src="quakeScript.js"></script>
        <script src="raphael-min.js"></script>
        <script src="spin.min.js"></script>
        
</head>
<body onload="startVis();">
    <div class="container">
  
     <?php include('../../includes/header.php'); ?>
    
        <div style="height: 250px"></div>
        <div style="text-align: center">
            
                <h3>Past 100 Earthquakes on Earth<br>
                Using real-time data from the United States Geological Survey (USGS) agency (<a href="http://earthquake.usgs.gov/earthquakes/feed/" target="_blank">Link</a>)</h3>
        <canvas id="canvas" style="border: dotted; width: 900px; height: 400px; display:none;" >
        Your browser does not support the HTML5 canvas tag. Try using Google Chrome.</canvas>
        <div id="svgTarget" style="height:600px; border-style: solid;
border-width:3px;"></div>
    </div>

    <?php include('../../includes/footer.php'); ?>
    </div>
</body>
</html>