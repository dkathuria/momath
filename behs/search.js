'use strict'
import P5Behavior from 'p5beh';
import * as Display from 'display';
import * as Floor from 'floor';
// const PF = require('pathfinding');

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
var vMatrix = [];
var links = {};
var indexes = [];
var numWalls = 0;
var drawQueue = [];
var timer = 0;
var searching = false;
var result = [];
var gridStates = [];
var algorithms = {
  "a" : "A* Pathfinding Algorithm",
  "b" : "Breadth First"
};

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
      
      xVal += size;
    }
    xVal = 0;
    yVal += size;
  }
  this.p5.fill(0, 102, 153);
  this.p5.strokeWeight(10);
  this.p5.text(algorithms[algo], 400, 20, size*4, size*4);
  // pb.drawPath();
}

P5Behavior.prototype.drawWall = function(user){
  var row = Math.floor(user.y/BLOCKSIZE);
  var col = Math.floor(user.x/BLOCKSIZE);
  if ((vMatrix[row][col] === 0 || vMatrix[row][col] === 3) && !searching){
    if (!user.hasOwnProperty("changed")) user.changed = 0;
    if (user.changed < 5 && numWalls < MAXWALLS) {
      user.changed++;
      vMatrix[row][col] = 1;
      numWalls++;
    }
  } if ((matrix[row][col] === 0 || matrix[row][col] === 3) && !searching){
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
  if (result === null) {
      var coordinates = indexes.map((index) => {
        return indexToRowCol(index);
      });
  } else {
      var coordinates = result.map((node) => {
          return [node.x, node.y];
      });
  }

  console.log(coordinates);
  for (var n = 0; n < coordinates.length - 1; n++){
    var startY = coordinates[n][0] * BLOCKSIZE + centerOffset;
    var startX = coordinates[n][1] * BLOCKSIZE + centerOffset;
    var endY = coordinates[n+1][0] * BLOCKSIZE + centerOffset;
    var endX = coordinates[n+1][1] * BLOCKSIZE + centerOffset;

    console.log(n, " : ", coordinates[n][1], coordinates[n+1][1]);

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
    if (vMatrix[xVal][yVal] === 2) done = true;
    else if (matrix[xVal][yVal] === 0 && matrix[xVal][yVal] !== 4) {
      drawQueue.push([xVal, yVal]);
      if (xVal === 9) console.log(yVal);
      vMatrix[xVal][yVal] = 3;
    }

    for (var neighbor in neighbors){
      addNeighbors(xVal, yVal, neighbors);
    }
  }

  // console.log(neighbors);
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
      // if ((matrix[newX][newY] === 0 || matrix[newX][newY] === 2) && !set.includes(newIndex)){
      if ((vMatrix[newX][newY] === 0 || vMatrix[newX][newY] === 2) && !set.includes(newIndex)){
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
  }
  indexes.push([current]);
  console.log(indexes);
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
      if(vMatrix[row][col] === 1) vMatrix[row][col] = 0;
    }
  }numWalls = 0;
}

function resetSearch(){
  for (var row=0; row < LEVELSIZE; row++){
    for (var col=0; col < LEVELSIZE; col++){
      if(matrix[row][col] === 3) matrix[row][col] = 0;
      if(vMatrix[row][col] === 3) vMatrix[row][col] = 0;
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
var algo = "";

pb.setup = function (p) {
  matrix = generateMatrix();
  vMatrix = generateMatrix();
  algo = "a";   
  find();
};
var length = 0;
function find(){
  setInterval(() => {
    algo = (algo === "a") ? "b" : "a";

    if (algo === "b" && !searching){
      searching = true;
      resetSearch();
      links = {};
      indexes = [];
      drawQueue = [];
      breadthFirst(9, 3);
      backTrack();
      console.log(drawQueue);
    }else if(algo === "a"){
      searching = true;
      resetSearch();
      gridStates = [];
      testAlgorithm();
      length = drawQueue.length;
    }
  }, 10000);  
}

pb.draw = function (floor) {
  this.clear();

  for (let u in floor.users) {
    pb.drawWall(floor.users[u]);
  }
  pb.drawMatrix(matrix, BLOCKSIZE); 

  if (searching){
    var coords = [];
    for(var i = 0; i < 5; i++){
      if (drawQueue.length > 0);
        coords.push(drawQueue.shift());
    }
    for (var c in coords){
      var coord = coords[c];
      if (coord){
        var val = matrix[coord[0]][coord[1]];
        console.log(val);
        if (val != 4 && val != 2){
          matrix[coord[0]][coord[1]] = 3;
        }
      }
    }
  }if (!searching){
    pb.drawPath();
  }if (drawQueue.length === 0){
    searching = false;  
    pb.drawPath();
  }

};


function testAlgorithm() {
  var graph = new Graph(matrix);
  var start = graph.nodes[START.x][START.y];
  var end = graph.nodes[END.x][END.y];
  result = astar.search(graph.nodes, start, end);
}

export const behavior = {
  title: "Sensor Debug (P5)",
  init: pb.init.bind(pb),
  frameRate: 'sensors',
  maxUsers: 5,
  render: pb.render.bind(pb)
};
export default behavior


/*  graph.js http://github.com/bgrins/javascript-astar
    MIT License

    Creates a Graph class used in the astar search algorithm.
    Includes Binary Heap (with modifications) from Marijn Haverbeke
        URL: http://eloquentjavascript.net/appendix2.html
        License: http://creativecommons.org/licenses/by/3.0/
*/

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/) {
        var len = this.length;
        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0) {
            from += len;
        }
        for (; from < len; ++from) {
            if (from in this && this[from] === elt) {
                return from;
            }
        }
        return -1;
    };
}

var GraphNodeType = { OPEN: 0, WALL: 1 };
function Graph(grid) {
    this.elements = grid;
    var nodes = [];

    var row, rowLength, len = grid.length;
    for (var x = 0; x < len; ++x) {
        row = grid[x];
        rowLength = row.length;
        nodes[x] = new Array(rowLength); // optimum array with size
        for (var y = 0; y < rowLength; ++y) {
            nodes[x][y] = new GraphNode(x, y, row[y]);
        }
    }
    this.nodes = nodes;
}
Graph.prototype.toString = function() {
    var graphString = "\n";
    var nodes = this.nodes;
    var rowDebug, row, y, l;
    for (var x = 0, len = nodes.length; x < len;) {
        rowDebug = "";
        row = nodes[x++];
        for (y = 0, l = row.length; y < l;) {
            rowDebug += row[y++].type + " ";
        }
        graphString = graphString + rowDebug + "\n";
    }
    return graphString;
};

function GraphNode(x,y,type) {
    this.data = {};
    this.x = x;
    this.y = y;
    this.pos = {x:x, y:y};
    this.type = type;
}
GraphNode.prototype.toString = function() {
    return "[" + this.x + " " + this.y + "]";
};
GraphNode.prototype.isWall = function() {
    return this.type == GraphNodeType.WALL;
};


/*  astar-list.js http://github.com/bgrins/javascript-astar
    MIT License

    ** You should not use this implementation (it is quite slower than the heap implementation) **

    Implements the astar search algorithm in javascript
    Based off the original blog post http://www.briangrinstead.com/blog/astar-search-algorithm-in-javascript
    It has since been replaced with astar.js which uses a Binary Heap and is quite faster, but I am leaving
    it here since it is more strictly following pseudocode for the Astar search
    **Requires graph.js**
*/

function takeAway(list, from, to) {
    var rest = list.slice((to || from) + 1 || list.length);
    list.length = from < 0 ? list.length + from : from;
    list.push.apply(list, rest);
    return list;
  };
}

var astar = {
  init: function(grid) {
    for(var x = 0; x < grid.length; x++) {
      for(var y = 0; y < grid[x].length; y++) {
        grid[x][y].f = 0;
        grid[x][y].g = 0;
        grid[x][y].h = 0;
        grid[x][y].visited = false;
        grid[x][y].closed = false;
        grid[x][y].debug = "";
        grid[x][y].parent = null;
      }
    }
  },
  search: function(grid, start, end, heuristic) {
    astar.init(grid);
    heuristic = heuristic || astar.manhattan;

    var openList   = [];
    openList.push(start);

    while(openList.length > 0) {

        // Grab the lowest f(x) to process next
        var lowInd = 0;
        for(var i=0; i<openList.length; i++) {
            if(openList[i].f < openList[lowInd].f) { lowInd = i; }
        }
        var currentNode = openList[lowInd];
        drawQueue.push([currentNode.x, currentNode.y])

        // End case -- result has been found, return the traced path
        if(currentNode == end) {
            var curr = currentNode;
            var ret = [];
            while(curr.parent) {
                ret.push(curr);
                curr = curr.parent;
            }
            return ret.reverse();
        }

        // Normal case -- move currentNode from open to closed, process each of its neighbors
        openList = takeAway(openList, lowInd);
        console.log(grid);
        gridStates.push(grid);
        currentNode.closed = true;

        var neighbors = astar.neighbors(grid, currentNode);
        for(var i=0; i<neighbors.length;i++) {
            var neighbor = neighbors[i];

            if(neighbor.closed || neighbor.isWall()) {
                // not a valid node to process, skip to next neighbor
                continue;
            }

            // g score is the shortest distance from start to current node, we need to check if
            //   the path we have arrived at this neighbor is the shortest one we have seen yet
            var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
            var gScoreIsBest = false;

            if(!neighbor.visited) {
                // This the the first time we have arrived at this node, it must be the best
                // Also, we need to take the h (heuristic) score since we haven't done so yet

                gScoreIsBest = true;
                neighbor.h = heuristic(neighbor.pos, end.pos);
                neighbor.visited = true;

                openList.push(neighbor);
            }
            else if(gScore < neighbor.g) {
                // We have already seen the node, but last time it had a worse g (distance from start)
                gScoreIsBest = true;
            }

            if(gScoreIsBest) {
                // Found an optimal (so far) path to this node.  Store info on how we got here and
                //  just how good it really is...
                neighbor.parent = currentNode;
                neighbor.g = gScore;
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.debug = "F: " + neighbor.f + "<br />G: " + neighbor.g + "<br />H: " + neighbor.h;
            }

        }

    }

    // No result was found -- empty array signifies failure to find path
    return [];
  },
  manhattan: function(pos0, pos1) {
      // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

      var d1 = Math.abs (pos1.x - pos0.x);
      var d2 = Math.abs (pos1.y - pos0.y);
      return d1 + d2;
  },
  neighbors: function(grid, node) {
      var ret = [];
      var x = node.x;
      var y = node.y;

      if(grid[x-1] && grid[x-1][y]) {
          ret.push(grid[x-1][y]);
      }
      if(grid[x+1] && grid[x+1][y]) {
          ret.push(grid[x+1][y]);
      }
      if(grid[x][y-1] && grid[x][y-1]) {
          ret.push(grid[x][y-1]);
      }
      if(grid[x][y+1] && grid[x][y+1]) {
          ret.push(grid[x][y+1]);
      }
      return ret;
  }
};