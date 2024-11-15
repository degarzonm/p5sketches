class Forest {
  constructor(points, color) {
    this.points = points;
    this.area = Math.abs(calculateArea(this.points)).toFixed(2);
    this.color = color;
    this.type = "Forest";
    this.ensureClockwise();
    this.selected = false;
    this.trees = []; // Array para almacenar posiciones de árboles
    this.maxMadera = floor(this.area/16); // Máxima cantidad de madera
    this.wood = 0; // Cantidad actual de madera
    this.minX = Math.min(...this.points.map((p) => p.X));
    this.maxX = Math.max(...this.points.map((p) => p.X));
    this.minY = Math.min(...this.points.map((p) => p.Y));
    this.maxY = Math.max(...this.points.map((p) => p.Y));

    // Crear un buffer para el bosque
    let bufferWidth = this.maxX - this.minX;
    let bufferHeight = this.maxY - this.minY;
    this.buffer = createGraphics(bufferWidth, bufferHeight);
    this.updateBuffer();
  }

  ensureClockwise() {
    if (calculateArea(this.points) > 0) {
      this.points.reverse();
    }
  }

  display() {
    image(this.buffer, this.minX, this.minY);

    // Si el bosque está seleccionado, dibujar un borde especial
    if (this.selected) {
      noFill();
      strokeWeight(9);
      let t = (sin(frameCount * 0.07) + 1) / 2;
      let colorOscilante = lerpColor(
        color(0),
        color(red(this.color), green(this.color), blue(this.color)),
        t
      );
      stroke(colorOscilante);

      beginShape();
      for (let point of this.points) {
        vertex(point.X, point.Y);
      }
      endShape(CLOSE);
    }
  }

  displayInfo(infoX, infoY) {
    text("Tipo: Bosque", infoX, infoY + 20);
    text("Area: " + this.area, infoX, infoY + 40);
    text("Madera: " + this.wood, infoX, infoY + 60);
    text("Madera máxima: " + this.maxMadera, infoX, infoY + 80);
    text("Número de árboles: " + this.trees.length, infoX, infoY + 100);
  }

  updateBuffer() {
    this.buffer.clear();

    // Dibujar el polígono del bosque
    this.buffer.fill(this.color);
    this.buffer.noStroke();
    this.buffer.beginShape();
    for (let point of this.points) {
      this.buffer.vertex(point.X - this.minX, point.Y - this.minY);
    }
    this.buffer.endShape(CLOSE);

    // Dibujar los árboles
    for (let i = 0; i < this.trees.length; i++) {
      this.buffer.fill(this.trees[i].colorw);
      this.buffer.strokeWeight(1);
      this.buffer.stroke(0);
      // Ajustar las coordenadas de los árboles restando minX y minY
      this.buffer.ellipse(
        this.trees[i].x - this.minX,
        this.trees[i].y - this.minY,
        12,
        12
      );
    }
  }

  generateTree() {
    if (this.wood >= this.maxMadera) return;

    // Generar un punto aleatorio dentro del polígono
    let attempts = 0;
    let maxAttempts = 10;
    let x, y;
    do {
      x = random(this.minX, this.maxX);
      y = random(this.minY, this.maxY);
      attempts++;
    } while (!this.containsPoint(x, y) && attempts < maxAttempts);

    if (attempts >= maxAttempts) return;
    let newTree = new TreeWood(x, y);
    this.trees.push(newTree);

    // Incrementar recursos de madera
    this.wood += newTree.wood;

    this.updateBuffer();
  }

  containsPoint(x, y) {
    let inside = false;
    let n = this.points.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      let xi = this.points[i].X,
        yi = this.points[i].Y;
      let xj = this.points[j].X,
        yj = this.points[j].Y;

      let intersect =
        yi > y !== yj > y &&
        x < ((xj - xi) * (y - yi)) / (yj - yi + 0.0000001) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }
}

function updateForests(newShape) {
  let updatedForests = [];
  for (let forest of forests) {
    let clipper = new ClipperLib.Clipper();

    let subj = [forest.points];
    let clip = [newShape];

    clipper.AddPaths(subj, ClipperLib.PolyType.ptSubject, true);
    clipper.AddPaths(clip, ClipperLib.PolyType.ptClip, true);

    let solution = new ClipperLib.Paths();

    let succeeded = clipper.Execute(
      ClipperLib.ClipType.ctDifference,
      solution,
      ClipperLib.PolyFillType.pftNonZero,
      ClipperLib.PolyFillType.pftNonZero
    );

    if (succeeded && solution.length > 0) {
      for (let path of solution) {
        let newForest = new Forest(path, forest.color);

        // Asignar árboles al nuevo bosque
        for (let tree of forest.trees) {
          if (newForest.containsPoint(tree.x+forest.minX, tree.y+forest.minY)) {
            newForest.trees.push(tree);
            newForest.wood += tree.wood;
          }
        }

        // Distribuir recursos de madera
        let areaRatio =
          Math.abs(calculateArea(path)) /
          Math.abs(calculateArea(forest.points));

        updatedForests.push(newForest);
      }
    }
  }
  forests = updatedForests;
}

class TreeWood {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.wood = floor(random(5, 21));
    this.colorw = color(random(45, 50), random(150, 190), random(0, 25));
  }

  display(pg) {
    // console.log('pg');
    pg.fill(this.colorw);
    pg.stroke(0);
    pg.strokeWeight(1);
    pg.ellipse(this.x, this.y, 12, 12);
  }
}
