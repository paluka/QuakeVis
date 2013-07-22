String[] response;
int arraySize;
float mag[];
float minMagn = 5.0;

void setup(){
 size(900, 400);
 String request = "proxy.php?url=http://comcat.cr.usgs.gov/fdsnws/event/1/query?limit=100&minmagnitude=5&format=geojson";
 response = loadStrings(request);
 arraySize = response.length;
 //arraySize = response.getJSONArray("features").size();
 mag = new float[arraySize];
 float mult = (10 - minMagn)*(minMagn*3);
  //int magnMult = (magn - (minMagn - 1)) * mult;
 for(int i = 0; i < arraySize; i++){
   //println(split(response[i], "\"mag\":")[1]);
   //println(response.getJSONArray("features").getJSONObject(i).getJSONObject("properties").getFloat("mag"));
   String split = split(response[i], "\"mag\":")[1];
   String s = split(split, ",\"")[0];
   println(s);
   mag[i] = (float(s) - (minMagn - 1)) * mult;
   
 }
}

void draw(){
  int startX = 0,
      midY = height/2,
      space = width/(arraySize - 1);
  
  
  //for(int i = 0; i < arraySize; i++){
  //  float mag2 = 0;//response.getJSONArray("features").getJSONObject(i).getJSONObject("properties").getFloat("mag");
   // mag[i] = (mag2 - 4)*100;  
 // }
    
  fill(255, 0, 0);
  noStroke();
  smooth();
  beginShape(); 
  vertex(startX, midY);
  curveVertex(startX, midY - mag[0]);
  curveVertex(startX, midY - mag[0]);
  int i;
  for(i = 1; i < arraySize; i++){
      curveVertex(startX + i*space, midY - mag[i]);
      ellipse(startX + i*space, midY, 10, 10);
  }
  curveVertex(startX + i*space, midY - mag[i - 1]);
  curveVertex(startX + i*space, midY - mag[i - 1]);
  
  // middle line
  vertex(startX + i*space, midY);
  vertex(startX, midY);
  
  
  curveVertex(startX, midY + mag[0]);
  curveVertex(startX, midY + mag[0]);
  
  for(i = 1; i < arraySize; i++){
      curveVertex(startX + i*space, midY + mag[i]);
      ellipse(startX + i*space, midY, 10, 10);
  }
  curveVertex(startX + i*space, midY + mag[i - 1]);
  curveVertex(startX + i*space, midY + mag[i - 1]);
  
  vertex(startX + i*space, midY);
  
  
  endShape();
}
