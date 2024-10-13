
let song;
var volumen;
var fftN = 512;
let maxTiempos=10
var frecuenciasHistoria = new Array(maxTiempos);
var amplitudHistoria = new Array(maxTiempos);


var points = [
  [0,0],
  [1,0],
  [0,1],
  [0.15,0.15],
  [0.5, 0.5]
]


function preload() {
  song = loadSound("../common/music/canc.ogg");
}

let vertices = [];

function setup() {
  //sonido setup
  createCanvas(600, 600, WEBGL);
  fft = new p5.FFT();
  
  for (var i = 0; i < frecuenciasHistoria.length; i++) {
    frecuenciasHistoria[i] = new Array(fftN);
    amplitudHistoria[i]= new Array(fftN);
  }
  //botones
  button = createButton("▶ ⏸");
  button.position(0, 0);
  button.mousePressed(playButtonAction);

  buttonR = createButton("Rand");
  buttonR.position(0, 30);
  buttonR.mousePressed(randomButtonAction);

  buttonRes = createButton("Reset");
  buttonRes.position(60, 30);
  buttonRes.mousePressed(resetSphereButtonAction);

  volumen = createSlider(0, 1, 0.8, 0.05);
  volumen.position(50, 0);
  volumen.style("width", "70px");
  volumen.input(cambioVolumen);

  //crea los sliders en la parte superior del canvas
  radio = createSlider(0, 400, 200);
  radio.position(width, 10);
  radio.style("width", "100px");
  radio.input(rNCambio);

  npuntos = createSlider(0, 2000, 1600);
  npuntos.position(width, 30);
  npuntos.style("width", "100px");
  npuntos.input(rNCambio);

  delta = createSlider(0, 0.1, 0.3, 0.001);
  delta.position(width, 50);
  delta.style("width", "100px");

  paletaColor = createColorPicker("#DD1C1C87");
  paletaColor.position(0, height + 5);
  paletaColor.input(setShade1);

  vertices = esferaFibonacci(0, 0, 0, radio.value(), npuntos.value());
}

function draw() {
  let espectro = fft.analyze(fftN);
  let amplitudes = fft.waveform();
  
  frecuenciasHistoria[frameCount%maxTiempos]=espectro
  amplitudHistoria[frameCount%maxTiempos]=amplitudes
  
  
  orbitControl();

  background(50);
  stroke(0);
  box(80);
  rotateX(0.0008 * frameCount);
  rotateY(0.00085 * sin(frameCount / 40));

  pintarVerticesMusica(vertices, amplitudes);
}

function esferaFibonacci(x0, y0, z0, r, n) {
  let v = [];

  let goldenRatio = (1 + 5 ** 0.5) / 2;

  for (let i = 0; i < n; i++) {
    let θ = (2 * PI * i) / goldenRatio;
    let φ = acos(1 - (2 * (i + 0.5)) / n);
    let x = x0 + r * cos(θ) * sin(φ);
    let y = y0 + r * sin(θ) * sin(φ);
    let z = z0 + r * cos(φ);
    v.push(createVector(x, y, z));
  }
  return v;
}

function pintarVerticesSecuencia(vertices, frq, limite=0) {
  beginShape(POINTS);
  
  for(var j=0;j<vertices.length && j<limite ;j++){
    stroke(frq[j % fftN], 155, 155);
    vertex(vertices[j].x, vertices[j].y, vertices[j].z);
  }
  endShape();
}

function pintarVerticesMusica(vertices, frq) {
  beginShape(POINTS);
  
    stroke(0, 155, 155);
  vertices.forEach((v, index) => {
    //creamos un vector normalizado para cada punto
    v_normal = p5.Vector.normalize(v);
    //a partir de este vector sumamos o restamos para que la distancia del centro al punto cmabie con la música
    v_final = p5.Vector.add(v, v_normal.mult(60*frq[index % fftN]));
    
    vertex(v_final.x, v_final.y, v_final.z);
  });

  endShape();
}


function ruidoRadial(ver, r, del = 0.05) {
  let vertices_final = [];
  ver.forEach((v) => {
    v_normal = p5.Vector.normalize(v);
    v_final = p5.Vector.add(v, v_normal.mult(random(-del * r, del * r)));
    vertices_final.push(createVector(v_final.x, v_final.y, v_final.z));
  });

  return vertices_final;
}

//acciones y actualizaciones de botones

function rNCambio() {
  vertices = esferaFibonacci(0, 0, 0, radio.value(), npuntos.value());
}

function setShade1() {
  fill(paletaColor.color());
}

function cambioVolumen() {
  song.setVolume(volumen.value());
}

function playButtonAction() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.play();
  }
}

function randomButtonAction() {
  vertices = ruidoRadial(vertices, radio.value(), delta.value());
}

function resetSphereButtonAction() {
  vertices = esferaFibonacci(0, 0, 0, radio.value(), npuntos.value());
}
