// p5.func examples - easing2_wah
// I<3DM rld

var p = 0.3;  //start point of every loop
var ease = new p5.Ease();
var styles = ease.listAlgos();// return an array listing all the algorithms
var curstyle;
var speed = 0.01;
var doclear;
var osc1, osc2, filt;

var tb; // textbox

let disthappy = 50;

//ml5 related
let video;
let poseNet;
let pose;
let skeleton;
let eyeR, eyeL,nose,earR, earL;

function setup()
{
  createCanvas(600, 400);
  doclear = 1;

  //random setup number, just to debug
  eyeR=270;
  eyeL=270;
  nose=270;
  earR=270;
  earL=270;
  
  for(let i=0; i<styles.length; i++){
    print(i);
    print(styles[i]);
  }

  video = createCapture(VIDEO);
  // Hook up poseNet
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  curstyle = random(styles);

  filt = new p5.LowPass();
  filt.res(20);
  filt.freq(800);

  osc1 = new p5.Oscillator();
  osc1.setType('square');
  osc1.freq(110.);
  osc1.amp(0.3);
  osc1.disconnect();
  osc1.connect(filt);
  osc1.start();

  osc2 = new p5.Oscillator();
  osc2.setType('sawtooth');
  osc2.freq(112.);
  osc2.amp(0.3);
  osc2.disconnect();
  osc2.connect(filt);
  osc2.start();

  tb = createDiv('');
  tb.style("font-family", "Courier");
  tb.style("font-size", "12px");
  tb.position(width*0.1, height*0.1);
  tb.size(500, 500);
}

function gotPoses(poses) {
  //console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  console.log('poseNet ready');
}


function draw()
{
  if(doclear)
  {

  
    if (pose) {
    print(pose);
    eyeR = pose.rightEye;
    eyeL = pose.leftEye;
    nose = pose.nose;
    earL = pose.leftEar;
    earR = pose.rightEar;
    
    }
    disthappy = nose.y-eyeR.y;
    print(disthappy);
    
    if(disthappy<0){
      curstyle = styles[40]; //the most unstable feeling---quadraticbezierStaircase
    }
    else if(disthappy>0 & disthappy<10){
      curstyle = styles[46];//doubleCubicOgee
    }
    else if(disthappy>10 & disthappy<20){
      curstyle = styles[41];//doubleExponentialSigmoid
    }
    else if(disthappy>20 & disthappy<30){
      curstyle = styles[6];//cubicInOut
    }
    else if(disthappy>30 & disthappy<35){
      curstyle = styles[49];//doubleQuadraticBezier
    }
    else{
      curstyle = styles[80];//most stable and peaceful---boxcar
    }
    
    
    background(255);
    noStroke();
    
    var hs = 'sound  ' + curstyle;
    tb.html(hs);
    
    doclear = 0;
  }
  fill(235,97,0);
  ellipse(eyeR.x, eyeR.y,15);
  ellipse(eyeL.x, eyeL.y,15);
  fill(255,255,0);
  rect(eyeR.x-10,eyeR.y-10, 30,5);
  rect(eyeL.x-10,eyeL.y-10, 30,5);
  
  fill(240,240,230,90);
  var q = ease[curstyle](p);
  ellipse(p*width*0.5+width*0.25, height-(q*height*0.5+height*0.3), 5, 5);
  
  if(nose.y<201){
    var wah = map(q, 0.2, 0.8, 45, 122);
  }
  else{
    var wah = map(q, 0.2, 0.8, 122, 45);
  }
  filt.freq(midiToFreq(wah));
  
  //draw nose
  fill(165,108,27);
  triangle(nose.x,nose.y-5-q*20, nose.x+4+q*16,nose.y+3+q*12, nose.x-4-q*16,nose.y+3+q*12);
  //draw mouth
  fill(246,109,81);
  ellipse(nose.x,nose.y+50,30,10+q*20);
  //draw ear
  fill(203,250,231,80);
  rect(earR.x+10,earR.y+20,20+q*10,40+q*10,10);
  rect(earL.x+10,earL.y+20,20+q*10,40+q*10,10);

  if(p+speed>0.7) doclear=1;
  p=(p+speed)%1.;
}