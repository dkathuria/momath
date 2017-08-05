import P5Behavior from 'p5beh';

const pb = new P5Behavior();

// for WEBGL: pb.renderer = 'webgl';

var walls = [];


pb.preload = function (p) {
  /* this == pb.p5 == p */
  // ...
}

pb.setup = function (p) {
  /* this == pb.p5 == p */
  /* P5Behavior already calls createCanvas for us */
  // setup here...
  var wall = {
    x: 50.0,
    y: 50.0
  }
  var wall2 = {
    x: 60.0,
    y: 31.0
  }
  walls.push(wall);
  walls.push(wall2);
};

pb.draw = function (floor, p) {
  /* this == pb.p5 == p */
  // draw here...
  this.clear();
  for (let u of floor.users) {
    pb.drawUser(u);
  }
  this.fill(128, 128, 128, 128);
  this.noStroke();
  pb.drawSensors(floor.sensors);

  for (var wall in walls){
    // console.log(walls[wall]);
    pb.drawWall(walls[wall]);
  }
};

export const behavior = {
  title: "Sensor Debug (P5)",
  init: pb.init.bind(pb),
  frameRate: 'sensors',
  render: pb.render.bind(pb),
  numGhosts: 1
};
export default behavior