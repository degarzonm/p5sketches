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
