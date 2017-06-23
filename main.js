const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.onresize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

function rotate2d(pos,rot){
 rot = rot * Math.PI / 180;
 return [pos[0] * Math.cos(rot) - pos[1] * Math.sin(rot),
         pos[0] * Math.sin(rot) + pos[1] * Math.cos(rot)];
}

function polygon(points,style){
 context.beginPath();
 context.fillStyle = style;
 context.moveTo(points[0].x,points[0].y);
 for(let i=1;i<points.length;i++){
  context.lineTo(points[i].x,points[i].y);
 }
 context.closePath();
 context.fill();
}

class Vec{
 // @param x Number 
 // @param y Number 
 // @param z Number 
 constructor(x = 0,y = 0,z = 0){
  this.x = x;
  this.y = y;
  this.z = z;
 }
 // @param rot Vec
 // @return Vec
 rotate(rot){
  let x = this.x,y = this.y,z = this.z;
  [z,y] = rotate2d([z,y],rot.x);
  [x,z] = rotate2d([x,z],rot.y);
  [x,y] = rotate2d([x,y],rot.z);
  return new Vec(x,y,z);
 }
 // @param pos Vec
 // @return Vec
 add(pos){return new Vec(this.x+pos.x,this.y+pos.y,this.z+pos.z);}
 // @param pos Vec
 // @return Vec
 sub(pos){return new Vec(this.x-pos.x,this.y-pos.y,this.z-pos.z);}
 // @param scalar Number
 // @return Vec
 multiply(scalar){return new Vec(this.x*scalar,this.y*scalar,this.z*scalar);}
};

class Cube{
 // @param pos Vec
 // @param size Number
 constructor(pos,size){
  this.pos = pos;
  this.size = size;
  this.faces = [[0,1,2,3],[4,5,6,7],[0,3,7,4],[1,2,6,5],[0,1,5,4],[3,2,6,7]];
  this.styles = ['rgb(255,255,255)','rgb(255,255,0)','rgb(0,0,255)','rgb(0,255,0)','rgb(255,0,0)','rgb(255,127,0)'];
 }
 // @return Array<Vec>
 points(){
  return [
   new Vec(this.pos.x-this.size/2,this.pos.y-this.size/2,this.pos.z-this.size/2),
   new Vec(this.pos.x+this.size/2,this.pos.y-this.size/2,this.pos.z-this.size/2),
   new Vec(this.pos.x+this.size/2,this.pos.y+this.size/2,this.pos.z-this.size/2),
   new Vec(this.pos.x-this.size/2,this.pos.y+this.size/2,this.pos.z-this.size/2),
   new Vec(this.pos.x-this.size/2,this.pos.y-this.size/2,this.pos.z+this.size/2),
   new Vec(this.pos.x+this.size/2,this.pos.y-this.size/2,this.pos.z+this.size/2),
   new Vec(this.pos.x+this.size/2,this.pos.y+this.size/2,this.pos.z+this.size/2),
   new Vec(this.pos.x-this.size/2,this.pos.y+this.size/2,this.pos.z+this.size/2)
  ];
 }
 // @param camera Object{pos:Vec,rot:Vec}
 // @param face Array<Number>
 // @param projected Array<Vec>
 value(camera,face,projected){
  let avg = 0;
  for(let idx of face){avg += projected[idx].z;}
  return avg / face.length;
 }
 // @param camera Object{pos:Vec,rot:Vec}
 render(camera){
  const projected = this.points().map(pt => {
   const half = pt.rotate(camera.rot).sub(camera.pos);
   return new Vec(half.x,half.y).multiply(Math.min(canvas.width/2,canvas.height/2)/half.z).add(new Vec(canvas.width/2,canvas.height/2,half.z));
  });
  const order = []; for(let i=0;i<this.faces.length;i++){order.push(i);};
  order.sort((a,b) => this.value(camera,this.faces[b],projected) - this.value(camera,this.faces[a],projected));
  for(let idx of order){
   polygon(this.faces[idx].map(v => projected[v]),this.styles[idx]);
  }
 }
};

const cube = new Cube(new Vec(0,0,0),2);
const camera = {'pos':new Vec(0,0,-5),'rot':new Vec()};
let speed = -3;

setInterval(() => {
 context.fillStyle = 'rgb(0,0,0)';
 context.fillRect(0,0,canvas.width,canvas.height);
 cube.render(camera);
 camera.rot = camera.rot.add(new Vec(speed,speed,speed));
 console.log(camera.rot);
 if(Math.abs(camera.rot.x) >= 90){speed *= -1;}
},1000/60);
