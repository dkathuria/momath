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
var links = {};
var indexes = [];
var numWalls = 0;


/*
*   ALL THE P5 BEHAVIOR FUNCTIONS
*/
let pb = new P5Behavior();
P5Behavior.prototype.drawMatrix = function(matrix, size){
  var xVal = 0, yVal = 0; 

  for (var row in matrix){
    for (var col in matrix[row]){
      this.p5.fill(152);
      this.p5.noStroke();
      this.p5.rect(xVal, yVal, size, size);

      var ele = matrix[row][col];
      // console.log(ele);
      switch(ele){
        case 1:
          this.p5.fill(125);
          break;
        case 2:
          this.p5.fill(255,0,0);
          break;
        case 3:
          this.p5.fill(135, 206, 250);
          break;
        case 4:
          this.p5.fill(0,128,0);
          break;
        default:
          this.p5.fill(255);
          break;
      }        
      this.p5.rect(xVal+1, yVal+1, size-2, size-2);
      this.p5.fill(0, 102, 153);
      this.p5.text(rowColToIndex(row, parseInt(col)), xVal+1, yVal+1, size-4, size-4);
      xVal += size;
    }
    xVal = 0;
    yVal += size;
  }
  pb.drawPath();
}

P5Behavior.prototype.drawWall = function(user){
  var row = Math.floor(user.y/BLOCKSIZE);
  var col = Math.floor(user.x/BLOCKSIZE);
  if (matrix[row][col] === 0 || matrix[row][col] === 3){
    if (!user.hasOwnProperty("changed")) user.changed = 0;
    if (user.changed < 5 && numWalls < MAXWALLS) {
      user.changed++;
      matrix[row][col] = 1;
      numWalls++;
    }
  }
}

P5Behavior.prototype.drawPath = function(){ //coordinates are indexes, not x/y values
  var centerOffset = BLOCKSIZE/2;
  var coordinates = indexes.map((index) => {
    return indexToRowCol(index);
  });

  console.log(indexes);

  for (var n = 0; n < coordinates.length - 1; n++){
    var startY = coordinates[n][0] * BLOCKSIZE + centerOffset;
    var startX = coordinates[n][1] * BLOCKSIZE + centerOffset;
    var endY = coordinates[n+1][0] * BLOCKSIZE + centerOffset;
    var endX = coordinates[n+1][1] * BLOCKSIZE + centerOffset;

    console.log(coordinates);
    console.log(startX, startY , " ---> ", endX, endY);
    this.p5.stroke(255,255,0);
    this.p5.strokeWeight(5);  
    this.p5.line(startX, startY, endX, endY);
  }
}

/*
*   Breadth First Search
*/

function breadthFirst(x, y){
  var done = false;
  var neighbors = [];

  neighbors = addNeighbors(x, y, neighbors);

  while (!done && neighbors.length > 0){
    var neighborIndex = neighbors.shift();
    var xVal = indexToRowCol(neighborIndex)[0];
    var yVal = indexToRowCol(neighborIndex)[1];
    if (matrix[xVal][yVal] === 2) done = true;
    else if (matrix[xVal][yVal] === 0 && matrix[xVal][yVal] !== 4) {
      matrix[xVal][yVal] = 3;
    }for (var neighbor in neighbors){
      addNeighbors(xVal, yVal, neighbors);
    }
  }

  console.log(neighbors);
}

function addNeighbors(x, y, set){
  var directions = [
    [0,1],
    [1,0],
    [0,-1],
    [-1,0]
  ];

  var index = rowColToIndex(x, y)
  for (var d in directions){
    var newX = x + directions[d][0];
    var newY = y + directions[d][1]
    var newIndex = rowColToIndex(newX, newY);
    if (newX >= 0 && newX < LEVELSIZE && newY >= 0 && newY < LEVELSIZE){
      if ((matrix[newX][newY] === 0 || matrix[newX][newY] === 2) && !set.includes(newIndex)){
        if (!links.hasOwnProperty(newIndex)){
          links[newIndex] = [];
        }links[newIndex].push(index);
        set.push(newIndex);
      }
    }
  }return set;
}

function backTrack(){
  indexes = [];
  var current = rowColToIndex(END.x, END.y);

  // console.log(current);
  while (links.hasOwnProperty(current)){
    indexes.push(current);
    current = links[current];
  }indexes.push(current);
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

  matrix[START.x][START.y] = 4;
  matrix[END.x][END.y] = 2;

  return matrix;
}

function resetWalls(){
  for (var row=0; row < LEVELSIZE; row++){
    for (var col=0; col < LEVELSIZE; col++){
      if(matrix[row][col] === 1) matrix[row][col] = 0;
    }
  }numWalls = 0;
}

function resetSearch(){
  for (var row=0; row < LEVELSIZE; row++){
    for (var col=0; col < LEVELSIZE; col++){
      if(matrix[row][col] === 3) matrix[row][col] = 0;
    }
  }
}

function rowColToIndex(x, y){
  return (x * LEVELSIZE) + y;
}

function indexToRowCol(index){
  return [Math.floor(index/LEVELSIZE), index%LEVELSIZE];
}


/*
*   Required pb functions  
*/

pb.setup = function (p) {
  matrix = generateMatrix();
  find();
};

function find(){
  setInterval(() => {
    resetSearch();
    links = {};
    indexes = [];
    breadthFirst(9, 3);
    backTrack();
  }, 3000);  
}

pb.draw = function (floor) {
  this.clear();
  for (let u in floor.users) {
    pb.drawWall(floor.users[u]);
  }

  if (floor.users.length > 0) console.log(floor.users);

  pb.drawMatrix(matrix, BLOCKSIZE); 
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