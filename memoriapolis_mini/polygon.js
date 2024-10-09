// Polygon.js

// Array of syllables for name generation
const syllables = ['pa', 'ta', 'ma', 'ca', 'ra', 'la', 'sa', 'na', 'ki', 'mi', 'li', 'si', 'ni', 'to', 'mo', 'lo', 'so', 'no'];
const suffixes = ['quirá', 'tiva', 'catá'];

// Clase Polygon que representa una localidad en el simulador
class Polygon {
  constructor(points, color) {
    this.points = points; // Puntos del polígono
    this.color = color; // Color del polígono

    // Generar nombre de la localidad
    let numSyllables = floor(random(1, 4)); // Entre 1 y 4 sílabas
    this.name = '';
    for (let i = 0; i < numSyllables; i++) {
      this.name += random(syllables);
    }
    this.name += random(suffixes);

    this.population = 0; // Población de la localidad
    this.densidad = 0.8;
    this.roads = []; // Array de caminos (segmentos de líneas)
    this.houses = []; // Array de casas
    this.lenPatio=0.5;
    this.spacing = random(30, 60); // Espaciamiento entre caminos paralelos
    this.selected = false; // Estado de selección
    this.ensureClockwise(); // Asegurar orientación clockwise
    this.generateRoads(); // Generar los caminos internos

    // Atributo fundacion para el frame en que se creó
    this.fundacion = frameCount;

    // Crear un buffer gráfico para el polígono
    this.buffer = createGraphics(width, height);

    // Bandera para indicar si la población cambió
    this.populationChanged = true;
  }

  // Método para actualizar el buffer gráfico
  updateBuffer() {
    this.buffer.clear();

    // Dibujar el polígono
    this.buffer.fill(this.color);
    this.buffer.stroke(120);
    this.buffer.strokeWeight(4);
    this.buffer.beginShape();
    for (let point of this.points) {
      this.buffer.vertex(point.X, point.Y);
    }
    this.buffer.endShape(CLOSE);

    // Dibujar los caminos internos
    this.buffer.stroke(100);
    this.buffer.strokeWeight(3);
    for (let road of this.roads) {
      this.buffer.line(road.start.X, road.start.Y, road.end.X, road.end.Y);
    }

    // Dibujar las casas
    for (let house of this.houses) {
      house.display(this.buffer);
    }
  }

  // Método para dibujar el polígono
  display() {
    // Actualizar el buffer si es necesario
    if ((frameCount + this.fundacion) % 60 === 0 && this.populationChanged) {
      this.updateBuffer();
      this.populationChanged = false;
    }

    // Mostrar el buffer
    image(this.buffer, 0, 0);

    // Si el polígono está seleccionado, dibujar el borde especial
    if (this.selected) {
      noFill();
      strokeWeight(9);
      let t = (sin(frameCount * 0.07) + 1) / 2; // Oscila entre 0 y 1
      let colorOscilante = lerpColor(color(0), color(red(this.color), green(this.color), blue(this.color)), t);
      stroke(colorOscilante);

      beginShape();
      for (let point of this.points) {
        vertex(point.X, point.Y);
      }
      endShape(CLOSE);
    }
  }


  
  // Método para calcular el área del polígono
  getArea() {
    return Math.abs( calculateArea(this.points));
  }

  // Método privado para calcular el área
  

  // Método para asegurar que el polígono tiene orientación clockwise
  ensureClockwise() {
    if ( calculateArea(this.points) > 0) {
      this.points.reverse();
    }
  }

  // Método para generar los caminos internos (líneas paralelas a un segmento base)
  generateRoads() {
    // Seleccionar un segmento base (el primer lado del polígono)
    if (this.points.length < 2) return;

    let baseSegment = {
      start: this.points[0],
      end: this.points[1],
    };

    // Calcular vector dirección del segmento base
    let dir = {
      X: baseSegment.end.X - baseSegment.start.X,
      Y: baseSegment.end.Y - baseSegment.start.Y,
    };

    // Normalizar el vector
    let mag = Math.hypot(dir.X, dir.Y);
    dir.X /= mag;
    dir.Y /= mag;

    // Calcular el vector normal (perpendicular) al segmento base
    let normal = {
      X: -dir.Y,
      Y: dir.X,
    };

    // Calcular límites del bounding box del polígono
    let minX = Math.min(...this.points.map(p => p.X));
    let maxX = Math.max(...this.points.map(p => p.X));
    let minY = Math.min(...this.points.map(p => p.Y));
    let maxY = Math.max(...this.points.map(p => p.Y));

    // Calcular centro del bounding box
    let centerX = (minX + maxX) / 2;
    let centerY = (minY + maxY) / 2;

    // Calcular la diagonal para determinar el número de líneas necesarias
    let diagonal = Math.hypot(maxX - minX, maxY - minY);
    let numLines = Math.ceil(diagonal / this.spacing);

    // Generar líneas paralelas al segmento base
    for (let i = -numLines; i <= numLines; i++) {
      let offset = i * this.spacing;
      let lineStart = {
        X: centerX + normal.X * offset - dir.X * 1000,
        Y: centerY + normal.Y * offset - dir.Y * 1000,
      };
      let lineEnd = {
        X: centerX + normal.X * offset + dir.X * 1000,
        Y: centerY + normal.Y * offset + dir.Y * 1000,
      };

      // Intersecar la línea con el polígono
      let clipper = new ClipperLib.Clipper();
      let subj = [[lineStart, lineEnd]]; // Línea como sujeto (open path)
      let clp = [this.points]; // Polígono como clip (closed path)

      let solution = new ClipperLib.PolyTree();

      clipper.AddPaths(subj, ClipperLib.PolyType.ptSubject, false); // false para open path
      clipper.AddPaths(clp, ClipperLib.PolyType.ptClip, true); // true para closed path

      // Ejecutar la operación de intersección
      let succeeded = clipper.Execute(
        ClipperLib.ClipType.ctIntersection,
        solution,
        ClipperLib.PolyFillType.pftNonZero,
        ClipperLib.PolyFillType.pftNonZero
      );

      // Si hay intersección, extraer los caminos abiertos resultantes
      if (succeeded) {
        let openPaths = ClipperLib.Clipper.OpenPathsFromPolyTree(solution);
        for (let path of openPaths) {
          if (path.length >= 2) {
            this.roads.push({
              start: path[0],
              end: path[path.length - 1],
            });
          }
        }
      }
    }
  }

  // Método para verificar si un punto está dentro del polígono
  containsPoint(x, y) {
    let inside = false;
    let n = this.points.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      let xi = this.points[i].X, yi = this.points[i].Y;
      let xj = this.points[j].X, yj = this.points[j].Y;

      let intersect = ((yi > y) !== (yj > y)) &&
                      (x < (xj - xi) * (y - yi) / (yj - yi + 0.0000001) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // Método para intentar generar una casa
    // Método para intentar generar una casa
  // Método para intentar generar una casa
  generateHouse() {
    // Definir la frecuencia y chance de generar una casa
    let chance = 0.99; // 99% de chance cada vez que se llama
    if (random() > chance) return;

    // Seleccionar aleatoriamente si la casa se genera en un camino o en el borde
    let isOnRoad = random() < 0.5;

    let targetSegments = isOnRoad ? this.roads : this.getBoundarySegments();

    if (targetSegments.length === 0) return;

    // Seleccionar una carretera o un segmento del borde aleatoriamente
    let segment = random(targetSegments);

    // Seleccionar una posición aleatoria a lo largo del segmento
    let t = random(); // 0 a 1
    let entryPoint = {
      X: lerp(segment.start.X, segment.end.X, t),
      Y: lerp(segment.start.Y, segment.end.Y, t)
    };

    // Definir el ancho de la entrada
    let entryWidth = 10;
    let lado = random() > 0.5 ? (isOnRoad ? 1 : -1) : -1;

    // Calcular el vector dirección del segmento base
    let dir = {
      X: lado * (segment.end.X - segment.start.X),
      Y: lado * (segment.end.Y - segment.start.Y),
    };

    // Normalizar el vector
    let mag = Math.hypot(dir.X, dir.Y);
    if (mag === 0) return; // evitar división por cero
    dir.X /= mag;
    dir.Y /= mag;

    // Calcular el vector normal (perpendicular) al segmento base
    let normal = {
      X: -dir.Y,
      Y: dir.X,
    };

    // Definir los dos puntos de la entrada (centro +/- half entryWidth)
    let halfWidth = entryWidth / 2;
    let entryStart = {
      X: entryPoint.X - normal.X * halfWidth,
      Y: entryPoint.Y - normal.Y * halfWidth,
    };
    let entryEnd = {
      X: entryPoint.X + normal.X * halfWidth,
      Y: entryPoint.Y + normal.Y * halfWidth,
    };

    // Definir el tamaño de la casa
    let houseWidth = entryWidth;
    let houseHeight = random(entryWidth, this.spacing *this.lenPatio);

    // Definir la separación entre la entrada y el camino/borde
    let separation = 5; // píxeles

    // Calcular la posición de la casa: desplazada desde la entrada hacia el interior usando el vector normal
    let housePos = {
      X: entryPoint.X + normal.X * separation,
      Y: entryPoint.Y + normal.Y * separation,
    };

    // Definir los puntos de la casa (rectángulo)
    let housePoints = [
      { X: housePos.X, Y: housePos.Y },
      { X: housePos.X + dir.X * houseWidth, Y: housePos.Y + dir.Y * houseWidth },
      { X: housePos.X + dir.X * houseWidth + normal.X * houseHeight, Y: housePos.Y + dir.Y * houseWidth + normal.Y * houseHeight },
      { X: housePos.X + normal.X * houseHeight, Y: housePos.Y + normal.Y * houseHeight }
    ];

    // Calcular el área original de la casa propuesta
    let originalArea = calculateArea(housePoints);
  
    // Crear una instancia de House
    let house = new House(housePoints);

    // Clipper para asegurar que la casa está dentro del polígono
    let clipper = new ClipperLib.Clipper();
    let subj = [house.points]; // Casa como sujeto
    let clp = [this.points]; // Polígono como clip

    let solution = new ClipperLib.Paths();

    clipper.AddPaths(subj, ClipperLib.PolyType.ptSubject, true); // true para closed path
    clipper.AddPaths(clp, ClipperLib.PolyType.ptClip, true); // true para closed path

    // Ejecutar la operación de intersección
    let succeeded = clipper.Execute(
      ClipperLib.ClipType.ctIntersection,
      solution,
      ClipperLib.PolyFillType.pftNonZero,
      ClipperLib.PolyFillType.pftNonZero
    );

    if (!succeeded || solution.length === 0) return;

    // Usar el primer path como la casa recortada
    let clippedHouse = solution[0];

    // Calcular el área después de recortar con el polígono
    let clippedArea = calculateArea(clippedHouse);

    // Verificar si el área es al menos el 30% del área original
    if (clippedArea < this.densidad * originalArea) return;

    // Ahora, bufferizar carreteras y bordes
    let bufferDistance = separation; // 5 píxeles

    let roadBuffers = [];
    let boundaryBuffers = [];

    // Bufferizar carreteras (ambos lados)
    for (let road of this.roads) {
      // Definir el ancho del buffer
      let roadWidth = 2 * bufferDistance; // Ancho total del buffer

      // Calcular el vector normalizado para el camino
      let roadDir = {
        X: road.end.X - road.start.X,
        Y: road.end.Y - road.start.Y
      };
      let roadMag = Math.hypot(roadDir.X, roadDir.Y);
      if (roadMag === 0) continue; // Evitar división por cero
      roadDir.X /= roadMag;
      roadDir.Y /= roadMag;

      let roadNormal = {
        X: -roadDir.Y,
        Y: roadDir.X
      };

      // Definir los cuatro puntos del rectángulo bufferizado
      let bufferPoints = [
        movePoint(road.start, roadNormal, bufferDistance),
        movePoint(road.end, roadNormal, bufferDistance),
        movePoint(road.end, roadNormal, -bufferDistance),
        movePoint(road.start, roadNormal, -bufferDistance)
      ];

      roadBuffers.push(bufferPoints);
    }

    // Bufferizar bordes de la localidad (solo hacia el interior)
    for (let boundary of this.getBoundarySegments()) {
      // Definir la distancia del buffer
      let boundaryBufferDistance = bufferDistance; // 5 píxeles

      // Calcular el vector normalizado para el borde
      let boundaryDir = {
        X: boundary.end.X - boundary.start.X,
        Y: boundary.end.Y - boundary.start.Y
      };
      let boundaryMag = Math.hypot(boundaryDir.X, boundaryDir.Y);
      if (boundaryMag === 0) continue; // Evitar división por cero
      boundaryDir.X /= boundaryMag;
      boundaryDir.Y /= boundaryMag;

      let boundaryNormal = {
        X: -boundaryDir.Y,
        Y: boundaryDir.X
      };

      // Definir los dos puntos de la entrada desplazados hacia el interior
      let bufferStart = movePoint(boundary.start, boundaryNormal, boundaryBufferDistance);
      let bufferEnd = movePoint(boundary.end, boundaryNormal, boundaryBufferDistance);

      // Definir el polígono del buffer (narrow rectangle hacia el interior)
      let bufferPolygon = [
        bufferStart,
        bufferEnd,
        movePoint(bufferEnd, boundaryDir, 1), // Pequeño desplazamiento para cerrar el polígono
        movePoint(bufferStart, boundaryDir, 1)
      ];

      boundaryBuffers.push(bufferPolygon);
    }

    // Combinar buffers de carreteras y bordes
    let totalBuffers = roadBuffers.concat(boundaryBuffers);

    // Crear una instancia de Clipper para ajustar la casa
    let clipperHouse = new ClipperLib.Clipper();

    // Agregar la casa recortada como sujeto
    clipperHouse.AddPaths([clippedHouse], ClipperLib.PolyType.ptSubject, true);

    // Agregar los buffers como clip
    clipperHouse.AddPaths(totalBuffers, ClipperLib.PolyType.ptClip, true);

    // Definir la solución
    let houseAdjusted = new ClipperLib.Paths();

    // Ejecutar la operación de diferencia: casa - buffers
    let succeededSubtract = clipperHouse.Execute(
      ClipperLib.ClipType.ctDifference,
      houseAdjusted,
      ClipperLib.PolyFillType.pftNonZero,
      ClipperLib.PolyFillType.pftNonZero
    );

    if (!succeededSubtract || houseAdjusted.length === 0) return;

    // Usar el primer path como la casa ajustada
    let adjustedHouse = houseAdjusted[0];

    // Calcular el área después de ajustar con buffers
    let adjustedArea = calculateArea(adjustedHouse);

    // Verificar si el área es al menos el 30% del área original
    if (adjustedArea < this.densidad * originalArea) return;

    // Ahora, considerar la intersección con casas existentes
    let finalHouse = adjustedHouse;

    // Substraer casas existentes del polígono de la casa propuesta
    for (let existingHouse of this.houses) {
      let clipperSubtract = new ClipperLib.Clipper();

      // Agregar la casa actual como sujeto
      clipperSubtract.AddPath(finalHouse, ClipperLib.PolyType.ptSubject, true);

      // Agregar la casa existente como clip
      clipperSubtract.AddPath(existingHouse.getPolygon(), ClipperLib.PolyType.ptClip, true);

      // Definir la solución
      let subtractSolution = new ClipperLib.Paths();

      // Ejecutar la operación de diferencia
      let succeededSubtract = clipperSubtract.Execute(
        ClipperLib.ClipType.ctDifference,
        subtractSolution,
        ClipperLib.PolyFillType.pftNonZero,
        ClipperLib.PolyFillType.pftNonZero
      );

      if (succeededSubtract && subtractSolution.length > 0) {
        // Usar el primer path como la casa resultante
        finalHouse = subtractSolution[0];
      } else {
        // Si la casa fue completamente solapada, descartarla
        finalHouse = null;
        break;
      }
    }

    if (!finalHouse || finalHouse.length < 3) {
      // La casa fue completamente solapada o es inválida
      return;
    }

    // Calcular el área después de considerar casas existentes
    let finalArea = calculateArea(finalHouse);

    // Verificar si el área es al menos el 30% del área original
    if (finalArea < this.densidad * originalArea) return;

    // Crear la casa con el polígono final
    let newHouse = new House(finalHouse);

    // Agregar la casa a la lista
    this.houses.push(newHouse);

    // Aumentar la población de la localidad
    this.population += floor(random(1, 6)); // entre 1 y 5

    // Marcar que la población cambió
    this.populationChanged = true;
  }

  // Método para obtener los segmentos del borde (sin contar roads)
  getBoundarySegments() {
    let segments = [];
    let n = this.points.length;
    for (let i = 0; i < n; i++) {
      segments.push({
        start: this.points[i],
        end: this.points[(i + 1) % n],
      });
    }
    return segments;
  }
}
function calculateArea(points) {
    let area = 0;
    let n = points.length;
    for (let i = 0; i < n; i++) {
      let j = (i + 1) % n;
      area += points[i].X * points[j].Y;
      area -= points[j].X * points[i].Y;
    }
    return area / 2;
  }

function movePoint(point, normal, distance) {
  return {
    X: point.X + normal.X * distance,
    Y: point.Y + normal.Y * distance
  };
}
