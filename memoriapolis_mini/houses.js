
class House {
  constructor(points) {
    this.points = points; // Array de puntos que definen el polígono de la casa
    this.color = this.randomBrownColor(); // Genera un color marrón aleatorio
  }

  // Método para dibujar la casa
  display(buffer = null) {
    if (!buffer) {
      buffer = window; // Si no se proporciona un buffer, usar el canvas principal
    }
    buffer.fill(this.color);
    buffer.stroke(0);
    buffer.strokeWeight(1);
    buffer.beginShape();
    for (let point of this.points) {
      buffer.vertex(point.X, point.Y);
    }
    buffer.endShape(CLOSE);
  }

  // Método para obtener el polígono de la casa
  getPolygon() {
    return this.points;
  }

  // Método para generar un color marrón aleatorio
  randomBrownColor() {
    let r = random(60, 190); // Rango de rojos entre marrón claro y oscuro
    let g = random(40, 95); // Rango de verdes para tonos de marrón
    let b = random(0, 100); // Rango de azules para tonos de marrón
    let a = 200; // Transparencia fija

    return color(r, g, b, a);
  }
}