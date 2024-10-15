let grid;
let cellSize = 15; // Tamaño de cada celda
let offsetX = 0; // Desplazamiento en X para arrastrar
let offsetY = 0; // Desplazamiento en Y para arrastrar
let noiseScale = 0.01;
let dragging = false;
let minH = -2000;
let maxH = 3000;
let previousMouse;

function setup() {
  // Crear el canvas
  canvas = createCanvas(840, 840);

  // Evitar el menú contextual al hacer clic derecho
  canvas.elt.oncontextmenu = () => false;

  // Configura una semilla para el ruido Perlin para consistencia
  noiseSeed(99); // Puedes cambiar este valor para obtener diferentes terrenos

  // Inicializar la grilla
  grid = new Grid(cellSize);

  // Generar las celdas visibles inicialmente
  grid.generateCellsInView(offsetX, offsetY, width, height);
}

function draw() {
  background(220);

  push();
  translate(offsetX, offsetY);
  grid.display();
  pop();
}

function mousePressed() {
  if (mouseButton === RIGHT) {
    dragging = true;
    previousMouse = createVector(mouseX, mouseY);
  }
}

function mouseDragged() {
  if (dragging) {
    let currentMouse = createVector(mouseX, mouseY);
    offsetX += currentMouse.x - previousMouse.x;
    offsetY += currentMouse.y - previousMouse.y;
    previousMouse = currentMouse;

    // Genera nuevas celdas y limpia las fuera de vista
    grid.generateCellsInView(offsetX, offsetY, width, height);
  }
}

function mouseReleased() {
  if (mouseButton === RIGHT) {
    dragging = false;
  }
}

// Clase que representa una celda individual
class Cell {
  constructor(i, j, size) {
    this.i = i; // Índice en X
    this.j = j; // Índice en Y
    this.size = size;
    this.x = i * size;
    this.y = j * size;
    this.height = this.generateHeight();
    this.color = this.getColorBasedOnHeight(this.height);
  }

  generateHeight() {
    // Utiliza las coordenadas globales para generar la altura
    // Ajuste para suavizar el terreno
    return map(noise(this.i * noiseScale, this.j * noiseScale), 0, 1, minH, maxH);
  }

  getColorBasedOnHeight(h) {
    // Definición de los puntos de la escala de colores
    let colorScale = [
      { value: minH, color: color(0, 0, 139) },        // Azul oscuro
      { value: -500, color: color(0, 0, 255) },         // Azul océano
      { value: -200, color: color(135, 206, 235) },     // Azul celeste
      { value: -20, color: color(173, 216, 230) },      // Azul claro
      { value: 0, color: color(255, 255, 224) },        // Amarillo claro
      { value: 40, color: color(154, 205, 50) },        // Amarillo verdoso
      { value: 400, color: color(144, 238, 144) },      // Verde claro
      { value: 900, color: color(34, 139, 34) },        // Verde fresco
      { value: 1500, color: color(0, 100, 0) },         // Verde oscuro
      { value: 1900, color: color(255, 165, 0) },       // Anaranjado montaña
      { value: 2200, color: color(128, 128, 128) },     // Marrón grisáceo
      { value: 2500, color: color(105, 105, 105) },     // Gris
      { value: maxH, color: color(255) }                // Blanco nieve
    ];

    // Encontrar los dos puntos entre los cuales se encuentra la altura
    let lower = colorScale[0];
    let upper = colorScale[colorScale.length -1];

    for(let i = 0; i < colorScale.length -1; i++) {
      if(h >= colorScale[i].value && h < colorScale[i+1].value) {
        lower = colorScale[i];
        upper = colorScale[i+1];
        break;
      }
    }

    // Calcular el porcentaje entre lower y upper
    let pct = map(h, lower.value, upper.value, 0, 1);
    pct = constrain(pct, 0, 1);

    // Interpolar entre los dos colores
    return lerpColor(lower.color, upper.color, pct);
  }

  display() {
    fill(this.color);
    noStroke();
    rect(this.x, this.y, this.size, this.size);
  }
}

// Clase que representa la grilla
class Grid {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.cells = new Map(); // Usamos un Map para almacenar las celdas con claves "i,j"
  }

  generateCellsInView(offsetX, offsetY, canvasWidth, canvasHeight) {
    // Determina el rango de celdas que deberían estar visibles
    let startX = -offsetX;
    let startY = -offsetY;
    let endX = startX + canvasWidth;
    let endY = startY + canvasHeight;

    let generationMargin = 2; // Margen adicional para generar celdas
    let deletionMargin = 4;   // Margen para eliminar celdas fuera de vista

    let startI = Math.floor(startX / this.cellSize) - generationMargin;
    let startJ = Math.floor(startY / this.cellSize) - generationMargin;
    let endI = Math.floor(endX / this.cellSize) + generationMargin;
    let endJ = Math.floor(endY / this.cellSize) + generationMargin;

    // Generar celdas necesarias
    for(let i = startI; i <= endI; i++) {
      for(let j = startJ; j <= endJ; j++) {
        this.addCell(i, j);
      }
    }

    // Eliminar celdas que están fuera del rango de eliminación
    let deletionStartI = Math.floor(startX / this.cellSize) - deletionMargin;
    let deletionStartJ = Math.floor(startY / this.cellSize) - deletionMargin;
    let deletionEndI = Math.floor(endX / this.cellSize) + deletionMargin;
    let deletionEndJ = Math.floor(endY / this.cellSize) + deletionMargin;

    let keysToDelete = [];
    for(let key of this.cells.keys()) {
      let [cellI, cellJ] = key.split(',').map(Number);
      if(cellI < deletionStartI || cellI > deletionEndI || cellJ < deletionStartJ || cellJ > deletionEndJ) {
        keysToDelete.push(key);
      }
    }

    // Eliminar las celdas fuera de rango
    for(let key of keysToDelete) {
      this.cells.delete(key);
    }
  }

  addCell(i, j) {
    let key = `${i},${j}`;
    if(!this.cells.has(key)) {
      let cell = new Cell(i, j, this.cellSize);
      this.cells.set(key, cell);
    }
  }

  display() {
    for(let cell of this.cells.values()) {
      cell.display();
    }
  }
}
