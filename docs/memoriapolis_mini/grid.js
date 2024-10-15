  
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