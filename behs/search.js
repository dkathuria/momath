'use strict'
import P5Behavior from 'p5beh';
import * as Display from 'display';

const pb = new P5Behavior();

// for WEBGL: pb.renderer = 'webgl';

var LEVELSIZE = 18;
var BLOCKSIZE = Display.width / LEVELSIZE;
var START = {
  x: 9,
  y: 3
};
var END = {
  x: 9,
  y: 15
};
var matrix = [];


pb.setup = function (p) {
  matrix = generateMatrix();
};

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

pb.draw = function (floor, p) {
  this.clear();
  // for (let u in floor.users) {
  //   pb.drawUser(floor.users[u]);
  // }
  this.fill(128, 128, 128, 128);
  this.noStroke();

  pb.drawMatrix(matrix, BLOCKSIZE, floor.users[0]);
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