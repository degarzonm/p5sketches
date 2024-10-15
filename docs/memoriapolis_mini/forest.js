class Forest {
    constructor(points, color) {
      this.points = points;
      this.color = color;
      this.type = 'Forest';
      this.ensureClockwise();
      this.selected = false;
      this.trees = []; // Array para almacenar posiciones de árboles
      this.maxMadera = floor(random(200, 1500)); // Máxima cantidad de madera
      this.wood = 0; // Cantidad actual de madera
      this.minX = Math.min(...this.points.map(p => p.X));
      this.maxX = Math.max(...this.points.map(p => p.X));
      this.minY = Math.min(...this.points.map(p => p.Y));
      this.maxY = Math.max(...this.points.map(p => p.Y));
  
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
        let colorOscilante = lerpColor(color(0), color(red(this.color), green(this.color), blue(this.color)), t);
        stroke(colorOscilante);
  
        beginShape();
        for (let point of this.points) {
          vertex(point.X, point.Y);
        }
        endShape(CLOSE);
      }
    }
  
    updateBuffer() {
      this.buffer.clear();
  
      // Dibujar el polígono del bosque
      this.buffer.fill(this.color);
      //this.buffer.stroke(120);
      //this.buffer.strokeWeight(4);
      this.buffer.noStroke();
      this.buffer.beginShape();
      for (let point of this.points) {
        this.buffer.vertex(point.X - this.minX, point.Y - this.minY);
      }
      this.buffer.endShape(CLOSE);
  
      // Dibujar los árboles
      for (let tree of this.trees) {
        let green = color(random(45, 50), random(150, 190), random(0, 25));
        this.buffer.fill(green);
        this.buffer.strokeWeight(1);
        this.buffer.stroke(0);
        this.buffer.ellipse(tree.X - this.minX, tree.Y - this.minY, 12, 12);
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
  
      this.trees.push({ X: x, Y: y });
  
      // Incrementar recursos de madera
      this.wood += floor(random(5, 21));
  
      this.updateBuffer();
    }
  
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
            if (newForest.containsPoint(tree.X, tree.Y)) {
              newForest.trees.push(tree);
            }
          }
  
          // Distribuir recursos de madera
          let areaRatio = Math.abs(calculateArea(path)) / Math.abs(calculateArea(forest.points));
          newForest.wood = floor(forest.wood * areaRatio);
          newForest.maxMadera = floor(forest.maxMadera * areaRatio);
  
          updatedForests.push(newForest);
        }
      }
    }
    forests = updatedForests;
  }