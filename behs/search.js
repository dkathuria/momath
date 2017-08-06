'use strict'
import P5Behavior from 'p5beh';
import * as Display from 'display';
import * as Floor from 'floor';
const PF = require('pathfinding');

var LEVELSIZE = 18;
var BLOCKSIZE = Display.width / LEVELSIZE;
var MAXWALLS = 100;

var START = {
  x: 9,
  y: 3
};
var END = {
  x: 9,
  y: 14
};

var matrix = [];
var numWalls = 0;


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
          this.p5.fill(125);
          break;
        case 4:
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

P5Behavior.prototype.drawWall = function(user){
  var row = Math.floor(user.y/BLOCKSIZE);
  var col = Math.floor(user.x/BLOCKSIZE);
  if (matrix[row][col] === 0){
    if (!user.hasOwnProperty("changed")) user.changed = 0;
    if (user.changed < 5 && numWalls < MAXWALLS) {
      user.changed++;
      matrix[row][col] = 3;
      numWalls++;
    }
  }
}


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

  return matrix;
}


/*
*   Required pb functions  
*/

pb.setup = function (p) {
  matrix = generateMatrix();
  // var grid = new PF.Grid(matrix);
  // var finder = new PF.AStarFinder();
  // var path = finder.findPath(9, 3, 9, 1, 4grid);
  // console.log(grid, path);
};

pb.draw = function (floor, p) {
  this.clear();
  for (let u in floor.users) {
    pb.drawWall(floor.users[u]);
  }

  if (floor.users.length > 0) console.log(floor.users);

  pb.drawMatrix(matrix, BLOCKSIZE); 
  bruteForce(9, 3); 
  // pb.drawSensors(floor.sensors);
};

export const behavior = {
  title: "Sensor Debug (P5)",
  init: pb.init.bind(pb),
  frameRate: 'sensors',
  maxUsers: 5,
  render: pb.render.bind(pb)
};
export default behavior