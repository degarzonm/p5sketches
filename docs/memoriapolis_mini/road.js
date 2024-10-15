class Road {
    constructor(points) {
      this.points = points;
      this.color = color(100); // Color del camino
      this.selected = false;
    }
  
    display() {
      fill(this.color);
      stroke(0);
      strokeWeight(1);
      beginShape();
      for (let point of this.points) {
        vertex(point.X, point.Y);
      }
      endShape(CLOSE);
  
      if (this.selected) {
        noFill();
        strokeWeight(3);
        stroke(255, 0, 0);
        beginShape();
        for (let point of this.points) {
          vertex(point.X, point.Y);
        }
        endShape(CLOSE);
      }
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