'use strict'
import p5 from 'p5'
import P5Behavior from 'p5beh';
import * as Display from 'display';
  

/*
*   ALL THE P5 BEHAVIOR FUNCTIONS
*/
let pb = new P5Behavior();
P5Behavior.prototype.drawMatrix = function(matrix, size){
  var xVal = 0, yVal = 0;
  this.p5.fill(255);
  this.p5.noStroke();
  this.p5.ellipse(xVal, yVal, 24);

  this.p5.noFill();
  this.p5.stroke(68);
  this.p5.strokeWeight(1);
  this.p5.ellipse(xVal, yVal, 31);  

  for (var row in matrix){
    for (var col in matrix[row]){
      this.p5.fill(152);
      this.p5.noStroke();
      this.p5.rect(xVal, yVal, size, size);

      var ele = matrix[row][col];
      // console.log(ele);
      switch(ele){
        case 1:
          this.p5.fill(0,128,0);
          break;
        case 2:
          this.p5.fill(255,0,0);
          break;
        case 3:
          this.p5.fill(135, 206, 250);
          break;
        default:
          this.p5.fill(255);
          break;
      }        
      this.p5.rect(xVal+1, yVal+1, size-2, size-2);
      this.p5.fill(0, 102, 153);
      this.p5.text(ele, xVal+1, yVal+1, size-4, size-4);
      xVal += size;
    }
    xVal = 0;
    yVal += size;
  }
}

var LEVELSIZE = 18;
var BLOCKSIZE = Display.width / LEVELSIZE;
var START = {
  x: 9,
  y: 3
};
var END = {
  x: 9,
  y: 14
};
var matrix = [];

/*
*   Helper functions
*/

function generateMatrix(){
  var row = [];
  for (var n = 0; n < LEVELSIZE; n++){
    row.push(0);
  }

  var matrix = [];
  for (var n = 0; n < LEVELSIZE; n++){
    matrix.push(row.slice());
  }

  matrix[START.x][START.y] = 1;
  matrix[END.x][END.y] = 2;

  return matrix
}

/*
*   Required pb functions  
*/

pb.setup = function (p) {
  matrix = generateMatrix();
};

pb.draw = function (floor, p) {
  this.clear();
  // for (let u in floor.users) {
  //   pb.drawUser(floor.users[u]);
  // }
  this.fill(128, 128, 128, 128);
  this.noStroke();

  pb.drawMatrix(matrix, BLOCKSIZE);  
  pb.drawSensors(floor.sensors);
};

export const behavior = {
  title: "Sensor Debug (P5)",
  init: pb.init.bind(pb),
  frameRate: 'sensors',
  render: pb.render.bind(pb),
  numGhosts: 1
};
export default behavior