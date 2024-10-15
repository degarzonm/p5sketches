// sketch.js

// Lista de polígonos completados
let polygons = [];
let roads = [];

let forests = []; // Lista de bosques completados
let treeGenerationFrequency = 2; // Frecuencia de generación de árboles

// Puntos del polígono en curso
let currentPoints = [];

// Estado de dibujo
let isDrawing = false;

// Tolerancia para cerrar el polígono (en píxeles)
let tolerance = 20;
let thickness = 4; // Grosor del camino
// Color del polígono actual
let currentColor;

// Polígono seleccionado
let selectedPolygon = null;

// Frecuencia de generación de casas (cada X frames)
let houseGenerationFrequency = 1; // Por ejemplo, cada 60 frames (~1 segundo a 60fps)

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
   createCanvas(1200, 800);
  // Activar el loop de dibujo
  loop();
  
  // Prevenir el menú contextual en clic derecho
  canvas.addEventListener('contextmenu', function(event) {
    event.preventDefault();
  });

  // Configura una semilla para el ruido Perlin para consistencia
  noiseSeed(66); // Puedes cambiar este valor para obtener diferentes terrenos

  // Inicializar la grilla
  grid = new Grid(cellSize);
  
  // Generar las celdas visibles inicialmente
  grid.generateCellsInView(offsetX, offsetY, width, height);
  ui = new UI();
}

function draw() {
  background(44, 77, 190);
  
  push();
  translate(offsetX, offsetY);
  grid.display();

  // Dibujar todos los bosques existentes
  for (let forest of forests) {
    forest.display();
  }

  // Dibujar todos los polígonos existentes
  for (let poly of polygons) {
    poly.display();
  }

  // Dibujar todos los caminos existentes
  for (let road of roads) {
    road.display();
  }

  // Dibujar el polígono o camino en curso
  if (isDrawing && currentPoints.length > 0) {
    if (ui.herramienta === 0) {
      drawCurrentPolygon(currentPoints, color(0, 255, 0, 100));
    } else if (ui.herramienta === 1) {
      drawCurrentPolyline(currentPoints, color(255, 0, 0, 100));
    } else if (ui.herramienta === 2) {
      drawCurrentPolygon(currentPoints, color(34, 139, 34, 100));
    }
  }

  // Mostrar detalles del objeto seleccionado
  if (selectedPolygon) {
    fill(11);
    noStroke();
    textSize(16); 
    let infoX = 10 - offsetX;
    let infoY = height - 70 - offsetY;
    text("Detalles del objeto seleccionado:", infoX, infoY);
    if (selectedPolygon.type === 'Polygon') {
      text("Tipo: Localidad", infoX, infoY + 20);
      text("Nombre: " + selectedPolygon.name, infoX, infoY + 40);
      text("Población: " + selectedPolygon.population, infoX, infoY + 60);
      text("Área: " + selectedPolygon.getArea().toFixed(2), infoX, infoY + 80);
    } else if (selectedPolygon.type === 'Road') {
      text("Tipo: Camino", infoX, infoY + 20);
    } else if (selectedPolygon.type === 'Forest') {
      text("Tipo: Bosque", infoX, infoY + 20);
      text("Madera: " + selectedPolygon.wood, infoX, infoY + 40);
      text("Número de árboles: " + selectedPolygon.trees.length, infoX, infoY + 60);
    }
  }

  // Generar casas cada X frames
  if (frameCount % houseGenerationFrequency === 0) {
    for (let poly of polygons) {
      poly.generateHouse();
    }
  }

  // Generar árboles en los bosques
  if (frameCount % treeGenerationFrequency === 0) {
    for (let forest of forests) {
      forest.generateTree();
    }
  }

  pop();
}


// Manejar el evento de clic del mouse
function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    return false;
  }
  
  let x = mouseX - offsetX;
  let y = mouseY - offsetY;

  if (mouseButton === LEFT) {
    if (ui.herramienta === 0) {
      // Herramienta "Crear localidad"
      if (isDrawing && currentPoints.length > 2) {
        let d = dist(x, y, currentPoints[0].X, currentPoints[0].Y);
        if (d < tolerance) {
          closePolygon();
          return false;
        }
      }
      currentPoints.push({ X: x, Y: y });
      isDrawing = true;
      redraw();
    } else if (ui.herramienta === 1) {
      // Herramienta "Crear Camino"
      if (isDrawing && currentPoints.length > 1) {
        let d = dist(x, y, currentPoints[currentPoints.length - 1].X, currentPoints[currentPoints.length - 1].Y);
        if (d < tolerance) {
          closePolygon();
          return false;
        }
      }
      currentPoints.push({ X: x, Y: y });
      isDrawing = true;
      redraw();
    } else if (ui.herramienta === 2) {
      // Herramienta "Crear Bosque"
      if (isDrawing && currentPoints.length > 2) {
        let d = dist(x, y, currentPoints[0].X, currentPoints[0].Y);
        if (d < tolerance) {
          closePolygon();
          return false;
        }
      }
      currentPoints.push({ X: x, Y: y });
      isDrawing = true;
      redraw();
    }
  } else if (mouseButton === RIGHT) {
    // Manejar selección con clic derecho
    let found = false;
    for (let poly of polygons) {
      if (poly.containsPoint(x, y)) {
        if (selectedPolygon && selectedPolygon !== poly) {
          selectedPolygon.selected = false;
        }
        selectedPolygon = poly;
        poly.selected = true;
        found = true;
        break;
      }
    }
    if (!found) {
      for (let road of roads) {
        if (road.containsPoint(x, y)) {
          if (selectedPolygon && selectedPolygon !== road) {
            selectedPolygon.selected = false;
          }
          selectedPolygon = road;
          road.selected = true;
          found = true;
          break;
        }
      }
    }
    if (!found) {
      for (let forest of forests) {
        if (forest.containsPoint(x, y)) {
          if (selectedPolygon && selectedPolygon !== forest) {
            selectedPolygon.selected = false;
          }
          selectedPolygon = forest;
          forest.selected = true;
          found = true;
          break;
        }
      }
    }
    if (!found && selectedPolygon) {
      selectedPolygon.selected = false;
      selectedPolygon = null;
    }
    redraw();
    return false;
  }
  if (mouseButton === CENTER) {
    dragging = true;
    previousMouse = createVector(mouseX, mouseY);
  }
}

function mouseDragged() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    return false;
  }
  if (dragging && mouseButton === CENTER) {
    let currentMouse = createVector(mouseX, mouseY);
    offsetX += currentMouse.x - previousMouse.x;
    offsetY += currentMouse.y - previousMouse.y;
    previousMouse = currentMouse;

    // Genera nuevas celdas y limpia las fuera de vista
    grid.generateCellsInView(offsetX, offsetY, width, height);
  }
}

function mouseReleased() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
    return false;
  }
  if (mouseButton === CENTER) {
    dragging = false;
  }
}

// Cerrar y procesar el polígono actual
function closePolygon() {
  if (ui.herramienta === 0) {
    // Herramienta "Crear localidad"
    currentColor = color(random(255), random(255), random(255), 100);
    let newPolygon = new Polygon(currentPoints, currentColor);

    if (polygons.length > 0 || roads.length > 0 || forests.length > 0) {
      let clipper = new ClipperLib.Clipper();

      let subj = [newPolygon.points];
      let existingPolygons = [];
      for (let poly of polygons) {
        existingPolygons.push(poly.points);
      }
      for (let road of roads) {
        existingPolygons.push(road.points);
      }
      for (let forest of forests) {
        existingPolygons.push(forest.points);
      }

      clipper.AddPaths(existingPolygons, ClipperLib.PolyType.ptClip, true);
      clipper.AddPaths(subj, ClipperLib.PolyType.ptSubject, true);

      let solution = new ClipperLib.Paths();

      let succeeded = clipper.Execute(
        ClipperLib.ClipType.ctDifference,
        solution,
        ClipperLib.PolyFillType.pftNonZero,
        ClipperLib.PolyFillType.pftNonZero
      );

      if (succeeded && solution.length > 0) {
        for (let path of solution) {
          let polyColor = color(random(255), random(255), random(255), 100);
          let newPoly = new Polygon(path, polyColor);
          polygons.push(newPoly);
        }
      }
    } else {
      polygons.push(newPolygon);
    }

    // Actualizar bosques
    updateForests(newPolygon.points);

  } else if (ui.herramienta === 1) {
    // Herramienta "Crear Camino"
    let co = new ClipperLib.ClipperOffset();
    co.AddPath(currentPoints, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etOpenButt);
    let offsetPaths = new ClipperLib.Paths();
    co.Execute(offsetPaths, thickness);

    if (offsetPaths.length > 0) {
      let roadPath = offsetPaths[0];
      let newRoad = new Road(roadPath);

      if (polygons.length > 0 || roads.length > 0 || forests.length > 0) {
        let clipper = new ClipperLib.Clipper();

        let subj = [newRoad.points];
        let existingPolygons = [];
        for (let poly of polygons) {
          existingPolygons.push(poly.points);
        }
        for (let road of roads) {
          existingPolygons.push(road.points);
        }
        for (let forest of forests) {
          existingPolygons.push(forest.points);
        }

        clipper.AddPaths(existingPolygons, ClipperLib.PolyType.ptClip, true);
        clipper.AddPaths(subj, ClipperLib.PolyType.ptSubject, true);

        let solution = new ClipperLib.Paths();

        let succeeded = clipper.Execute(
          ClipperLib.ClipType.ctDifference,
          solution,
          ClipperLib.PolyFillType.pftNonZero,
          ClipperLib.PolyFillType.pftNonZero
        );

        if (succeeded && solution.length > 0) {
          for (let path of solution) {
            let newRoad = new Road(path);
            roads.push(newRoad);
          }
        }
      } else {
        roads.push(newRoad);
      }

      // Actualizar bosques
      updateForests(newRoad.points);
    }
  } else if (ui.herramienta === 2) {
    // Herramienta "Crear Bosque"
    let forestColor = color(34, 139, 34, 100);
    let newForest = new Forest(currentPoints, forestColor);

    if (polygons.length > 0 || roads.length > 0 || forests.length > 0) {
      let clipper = new ClipperLib.Clipper();

      let subj = [newForest.points];
      let existingPolygons = [];
      for (let poly of polygons) {
        existingPolygons.push(poly.points);
      }
      for (let road of roads) {
        existingPolygons.push(road.points);
      }
      for (let forest of forests) {
        existingPolygons.push(forest.points);
      }

      clipper.AddPaths(existingPolygons, ClipperLib.PolyType.ptClip, true);
      clipper.AddPaths(subj, ClipperLib.PolyType.ptSubject, true);

      let solution = new ClipperLib.Paths();

      let succeeded = clipper.Execute(
        ClipperLib.ClipType.ctDifference,
        solution,
        ClipperLib.PolyFillType.pftNonZero,
        ClipperLib.PolyFillType.pftNonZero
      );

      if (succeeded && solution.length > 0) {
        for (let path of solution) {
          let newForest = new Forest(path, forestColor);
          forests.push(newForest);
        }
      }
    } else {
      forests.push(newForest);
    }
  }

  currentPoints = [];
  isDrawing = false;
  redraw();
}

// Función para dibujar el polígono en curso con el círculo en el primer vértice
function drawCurrentPolygon(points, colorFill) {
  fill(colorFill);
  strokeWeight(2)
  stroke(0);
  beginShape();
  for (let point of points) {
    vertex(point.X, point.Y);
  }
  endShape();

  // Dibujar un círculo rojo en el primer vértice para facilitar el cierre
  if (points.length > 0) {
    noStroke();
    fill(255, 0, 0);
    ellipse(points[0].X, points[0].Y, 10, 10);
  }
}
function drawCurrentPolyline(points, colorStroke) {
  noFill();
  stroke(colorStroke);
  strokeWeight(2);
  beginShape();
  for (let point of points) {
    vertex(point.X, point.Y);
  }
  endShape();
}
// Manejar la presión de teclas
function keyPressed() {
  if (key === 'r' || key === 'R') {
    polygons = [];
    roads = [];
    forests = [];
    currentPoints = [];
    isDrawing = false;
    selectedPolygon = null;
    redraw();
  }
}
