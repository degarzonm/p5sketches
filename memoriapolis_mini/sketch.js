// sketch.js

// Lista de polígonos completados
let polygons = [];

// Puntos del polígono en curso
let currentPoints = [];

// Estado de dibujo
let isDrawing = false;

// Tolerancia para cerrar el polígono (en píxeles)
let tolerance = 20;

// Color del polígono actual
let currentColor;

// Polígono seleccionado
let selectedPolygon = null;

// Frecuencia de generación de casas (cada X frames)
let houseGenerationFrequency = 1; // Por ejemplo, cada 60 frames (~1 segundo a 60fps)

function setup() {
  // Aumentamos la altura del canvas para dejar espacio para las etiquetas
  createCanvas(1200, 600 + 100);
  // Activar el loop de dibujo
  loop();
  
  // Prevenir el menú contextual en clic derecho
  canvas.addEventListener('contextmenu', function(event) {
    event.preventDefault();
  });
}

function draw() {
  background(44, 77, 190);

  // Dibujar todos los polígonos existentes
  for (let poly of polygons) {
    poly.display(); // Usar el método draw actualizado de Polygon
  }

  // Dibujar el polígono en curso si está siendo dibujado
  if (isDrawing && currentPoints.length > 0) {
    drawCurrentPolygon(currentPoints, color(0, 255, 0, 100));
  }

  // Mostrar detalles del polígono seleccionado
  if (selectedPolygon) {
    fill(11);
    noStroke();
    textSize(16); 
    let infoY = height - 70;
    text("Detalles de la localidad seleccionada:", 10, infoY);
    text("Nombre: " + selectedPolygon.name, 10, infoY + 20);
    text("Población: " + selectedPolygon.population, 10, infoY + 40);
    text("Área: " + selectedPolygon.getArea().toFixed(2), 10, infoY + 60);
  }

  // Generar casas cada X frames
  if (frameCount % houseGenerationFrequency === 0) {
    for (let poly of polygons) {
      poly.generateHouse();
    }
  } 
}


// Manejar el evento de clic del mouse
function mousePressed() {
  if (mouseButton === LEFT) {
    // Si estamos dibujando y el clic está cerca del primer punto, cerrar el polígono
    if (isDrawing && currentPoints.length > 2) {
      let d = dist(mouseX, mouseY, currentPoints[0].X, currentPoints[0].Y);
      if (d < tolerance) {
        closePolygon();
        return false; // Prevenir el menú contextual
      }
    }

    // Agregar el nuevo punto al polígono en curso
    currentPoints.push({ X: mouseX, Y: mouseY });
    isDrawing = true;
    redraw();
  } else if (mouseButton === RIGHT) {
    // Manejar selección con clic derecho
    let found = false;
    for (let poly of polygons) {
      if (poly.containsPoint(mouseX, mouseY)) {
        // Seleccionar este polígono y deseleccionar el anterior
        if (selectedPolygon && selectedPolygon !== poly) {
          selectedPolygon.selected = false;
        }
        selectedPolygon = poly;
        poly.selected = true;
        found = true;
        break;
      }
    }
    if (!found && selectedPolygon) {
      // Si se hizo clic derecho fuera de cualquier polígono, deseleccionar
      selectedPolygon.selected = false;
      selectedPolygon = null;
    }
    redraw();
    return false; // Prevenir el menú contextual del navegador
  }
}

// Cerrar y procesar el polígono actual
function closePolygon() {
  // Asignar un color aleatorio al polígono ANTES de crear la instancia
  currentColor = color(random(255), random(255), random(255), 100);

  // Crear instancia de Polygon con el color actual
  let newPolygon = new Polygon(currentPoints, currentColor);

  // Si existen polígonos previos, procesar la intersección
  if (polygons.length > 0) {
    // Crear una instancia de Clipper
    let clipper = new ClipperLib.Clipper();

    // Agregar el nuevo polígono como sujeto
    let subj = [newPolygon.points];

    // Unir todos los polígonos existentes para formar el clip
    let existingPolygons = [];
    for (let poly of polygons) {
      existingPolygons.push(poly.points);
    }

    // Agregar todos los polígonos existentes como clip
    clipper.AddPaths(existingPolygons, ClipperLib.PolyType.ptClip, true);

    // Agregar el nuevo polígono como sujeto
    clipper.AddPaths(subj, ClipperLib.PolyType.ptSubject, true);

    // Definir la solución para la diferencia
    let solution = new ClipperLib.Paths();

    // Ejecutar la operación de diferencia: sujeto - clip
    let succeeded = clipper.Execute(
      ClipperLib.ClipType.ctDifference,
      solution,
      ClipperLib.PolyFillType.pftNonZero,
      ClipperLib.PolyFillType.pftNonZero
    );

    // Si la operación fue exitosa y hay resultados
    if (succeeded && solution.length > 0) {
      // Crear nuevos polígonos a partir de la solución
      for (let path of solution) {
        let polyColor = color(random(255), random(255), random(255), 100);
        let newPoly = new Polygon(path, polyColor);
        polygons.push(newPoly);
      }
    }
    // Si no hay diferencia, el polígono no se añade
  } else {
    // Si no hay polígonos previos, simplemente añadir el nuevo polígono
    polygons.push(newPolygon);
  }

  // Reiniciar el polígono en curso y el estado de dibujo
  currentPoints = [];
  isDrawing = false;
  redraw();
}

// Función para dibujar el polígono en curso con el círculo en el primer vértice
function drawCurrentPolygon(points, colorFill) {
  fill(colorFill);
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

// Manejar la presión de teclas
function keyPressed() {
  // Resetear todo si se presiona la tecla "r" o "R"
  if (key === 'r' || key === 'R') {
    polygons = [];
    currentPoints = [];
    isDrawing = false;
    selectedPolygon = null;
    redraw();
  }
}
