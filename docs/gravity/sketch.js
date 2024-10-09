let grafo;
let flagPlay=true
let G = 0.0006; // constante gravitacional
let galaxG = 0.0005;//velocidad galáctica
let dt = 0.05; // delta t 
const e = 2.718281828;
let rExplos = 26;
let masaCampo = 1000;
let masaReduccionPerc = 0.66;
let maxP = 40;
let fading;
let mousePree;
let mousePost;
let sliderDv;

function preload() {
  soundFormats("mp3", "ogg");
  jointSound = loadSound("clack");
}

function setup() {
  createCanvas(1450, 750);
  frameRate(60);
  mousePree = createVector(0, 0);
  mousePost = createVector(0, 0);
  grafo = new Grafo();
 

  let campoMasa = createInput(str(masaCampo));
  campoMasa.position(0, 0);
  campoMasa.style("width", "55px");
  campoMasa.input(funCampoMasa);

  let botonBack = createButton("fondo");
  botonBack.position(0, 20);
  botonBack.mousePressed(changeBG);
  botonBack.style("width", "60px");
  let botonLimpiar = createButton("limpiar");
  botonLimpiar.position(0, 40);
  botonLimpiar.mousePressed(limpiaGrafo);
  botonLimpiar.style("width", "60px");

  let campoNewDots = createInput(str(maxP));
  campoNewDots.position(70, 0);
  campoNewDots.style("width", "50px");
  campoNewDots.input(funNewDots);

  let botonNewDots = createButton("nuevos");
  botonNewDots.position(70, 20);
  botonNewDots.mousePressed(botnNewDots);

  sliderDv = createSlider(0, 5, 0.5);
  sliderDv.position(70, 40);
  sliderDv.style("width", "60px");

  fading = createSlider(0, 4, 1, 0.1);
  fading.position(0, 60);
  fading.style("width", "120px");

  let botonDetener = createButton("detener");
  botonDetener.position(0, 80);
  botonDetener.mousePressed(botnDetener);

  let botonPausa = createButton("pausa");
  botonPausa.position(0, 100);
  botonPausa.mousePressed(() => {
    flagPlay = !flagPlay
  });

  let botonGalax = createButton("galaxia");
  botonGalax.position(0, 130);
  botonGalax.mousePressed(botnGalax);
  background(2, 5, 33);
}

function draw() {
  if(flagPlay){
  //if(frameCount%12==0)
  background(2, 5, 33, fading.value());
  grafo.actualizaEstados();
  grafo.render();}
  //if(grafo.nodos.length<maxP)grafo.agregaNnodosRand(1, 10, 5000);
}

function mousePressed() {
  //console.log('pressed');
  mousePree.x = mouseX;
  mousePree.y = mouseY;
  noFill();
  strokeWeight(1);
  stroke(255);
  ellipse(mousePree.x, mousePree.y, 30, 30);
}

function mouseReleased() {
  //console.log('clicked');
  mousePost.x = mouseX;
  mousePost.y = mouseY;
  strokeWeight(1);
  stroke(200, 217, 214, 100);
  var direccion = createVector(
    (mousePost.x - mousePree.x) / 50,
    (mousePost.y - mousePree.y) / 50
  );
  line(mousePree.x, mousePree.y, mousePost.x, mousePost.y);
  fill(0, 0, 0, 255);
  ellipse(mousePree.x, mousePree.y, 30, 30);
  if (mouseBounds())
    grafo.agregaNodo(new Dot(mousePree, masaCampo, direccion.x, direccion.y));
}

function changeBG() {
  background(10);
}

function limpiaGrafo() {
  grafo.nodos = [];
}

function funCampoMasa() {
  masaCampo = int(this.value());
}
function funNewDots() {
  maxP = int(this.value());
}

function botnNewDots() {
  grafo.agregaNnodosRand(
    maxP,
    masaCampo * 0.2,
    masaCampo,
    sliderDv.value(),
    sliderDv.value()
  );
}

function botnDetener() {
  grafo.nodos.map((n) => {
    n.vel = createVector(0, 0);
  });
}
function botnGalax() {
  doGalax(maxP, createVector(width / 2, height / 2), 250);
}


function doGalax(n, c, Rgrande) {
  for (let i = 0; i < n; i++) {
    let angle = random(0, 2 * PI);
    let rmin = random(0, Rgrande);
    let ubi = createVector(rmin * cos(angle) + c.x, rmin * sin(angle) + c.y);
    let mas = random(1, masaCampo);
    let dx = (ubi.x - c.x) * galaxG;
    let dy = -(ubi.y - c.y) * galaxG;
    let p = new Dot(ubi, mas, dy, dx);
    grafo.agregaNodo(p);
  }
}

function mouseBounds() {
  return mouseX > 160 || mouseY > 120;
}

class Dot {
  constructor(ubicacion, masa, dx, dy) {
    this.centro = createVector(ubicacion.x, ubicacion.y);
    this.masa = masa;
    this.radio = log(e + this.masa / 1000) / log(e); // calculate mass from radius using a logarithm

    this.colorbase = colorMasa(this.radio);

    this.vel = createVector(dx, dy);
  }

  dibujarP() {
    strokeWeight(1);
    stroke(
      this.colorbase.levels[0] - 40,
      this.colorbase.levels[1] - 40,
      this.colorbase.levels[2] - 40
    );
    fill(this.colorbase);
    ellipse(this.centro.x, this.centro.y, this.radio * 2, this.radio * 2);
  }

  actualizaPos() {
    // update position based on velocity
    this.centro.add(this.vel);

    if (this.centro.x > width) {
      this.centro.x = 0;
      this.masa = this.masa * masaReduccionPerc - 0.05;
    }
    if (this.centro.x < -2) {
      this.centro.x = width;
      this.masa = this.masa * masaReduccionPerc - 0.05;
    }
    if (this.centro.y > height) {
      this.centro.y = 0;
      this.masa = this.masa * masaReduccionPerc - 0.05;
    }
    if (this.centro.y < -2) {
      this.centro.y = height;
      this.masa = this.masa * masaReduccionPerc - 0.05;
    }
    this.radio = log(e + this.masa / 1000);
  }

  choqueInel(otroN) {
    let freq = -map(this.radio, 0.01, 20, -2, -0.06);
    jointSound.rate(freq);
    let ampli = map(this.radio, 0.01, 20, 0.05, 1);
    jointSound.amp(ampli);
    let orientacionStereo = map(this.centro.x, 0, width, -1.0, 1.0);
    jointSound.pan(orientacionStereo);
    jointSound.play();
    this.vel = this.vel
      .mult(this.masa)
      .add(otroN.vel.mult(otroN.masa))
      .mult(1 / (this.masa + otroN.masa));
    this.actualizarMasa(otroN.masa);
  }

  actualizarMasa(nuevaM) {
    this.masa += nuevaM;
    this.radio = log(2.71828 + this.masa / 1000) / log(2.71828);
    this.colorbase = colorMasa(this.radio);
  }

  colapsar() {
    this.masa = -0.001;
    this.radio = 0;
    this.colorbase = color(0);
  }
}

class Grafo {
  constructor() {
    this.nodos = [];
  }

  agregaNodo(punto) {
    this.nodos.push(punto);
  }

  agregaNnodosRand(numDots, a, b, dx, dy) {
    for (let i = 0; i < numDots; i++) {
      const center = createVector(random(width), random(height));
      const mass = floor(random(a, b));
      const dot = new Dot(
        center,
        mass,
        random(dx) - dx / 2,
        random(dy) - dy / 2
      );
      this.agregaNodo(dot);
    }
    this.actualizaEstados();
  }

  actualizaEstados() {
    // update each dot in the graph
    this.nodos.map((node) => {
      this.nodos.map((otro_nodo) => {
        if (otro_nodo !== node) {
          let distancia = p5.Vector.dist(node.centro, otro_nodo.centro);

          if (distancia > (node.radio + otro_nodo.radio) * 1.05) {
            let force = (G * node.masa * otro_nodo.masa) / pow(distancia, 2.0);
            let direction = p5.Vector.sub(
              otro_nodo.centro,
              node.centro
            ).normalize();
            let acceleration = direction.mult(force / node.masa);
            node.vel.add(acceleration.mult(dt));
          } else {
            fill(230, 100, 40, 100);
            let explr = (rExplos * (node.radio + otro_nodo.radio)) / 2;
            ellipse(node.centro.x, node.centro.y, explr, explr);
            if (node.masa > otro_nodo.masa) {
              node.choqueInel(otro_nodo);
              otro_nodo.colapsar();
            } else {
              otro_nodo.choqueInel(node);
              node.colapsar();
            }
          }
        }
      });
      node.actualizaPos();
    });
    this.nodos = this.nodos.filter((node) => filtroMasa(node));
  }

  decimeMasas() {
    var m = 0;
    this.nodos.map((x) => (m += x.masa));
    console.log(m);
  }

  render() {
    this.nodos.map((node) => node.dibujarP());
  }
}

function filtroBordes(vec) {
  return vec.x > 0 && vec.x < width && vec.y > 0 && vec.y < height;
}

function filtroMasa(d) {
  return d.masa > 0;
}

function pulsoExp(x, y, xt, s = 0.5) {
  return -(1.0 - y) * exp(-s * pow(xt - x, 2));
}

function colorMasa(masa) {
  let rojo = (1.0 + pulsoExp(2.0, 0.2, masa, 2.7)) * 255;
  let verde = (1.0 + pulsoExp(3.8, 0.05, masa, 1.0)) * 255;
  let azul =
    255 *
    (1.0 +
      pulsoExp(1.5, 0.2, masa, 9.8) +
      pulsoExp(3.0, 0.4, masa, 2.5) +
      pulsoExp(4.5, 0.2, masa, 50.0));
  return color(rojo, verde, azul);
}
