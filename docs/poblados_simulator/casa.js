// Clase para representar la Casa
class Casa {
  constructor(i, j, colorAldeano) {
    this.id = generateUUID();
    this.i = i;
    this.j = j;
    this.orientacion = radians(random(-30, 30));
    this.celdas = [];
    this.recurso_0 = COSTO_EXPANSION_CASA;
    this.colorBase = lerpColor(colorAldeano, color(255, 255, 255, 5), 0.5);
    this.colorEntrada = colorAldeano;
    this.abandonada = false; // Nueva propiedad para saber si la casa está abandonada
    this.tAbandonada = 0; // Contador de frames desde que fue abandonada
    this.ocupantes = []; // Lista de aldeanos ocupantes
    this.buffer = createGraphics(tamCelda * cols, tamCelda * filas); // Tamaño máximo basado en el grid
    this.necesitaRedibujar = true; // Indicador para redibujar
    this.numCeldas = 0; // Almacena el número de celdas previamente para detectar cambios
  
    this.creaCeldas();
  }

  actualiza(aumento) {
    //console.log("updating")
    this.recurso_0 += aumento;
    if (this.recurso_0 >= COSTO_EXPANSION_CASA /*  *this.cells.length  */) {
      //console.log('recurso_0 supera el umbral, llamando a crece() ');
      this.crece();
    }
  }

  creaCeldas() {
    let posEntrada = { i: this.i, j: this.j };

    // Configurar la casilla de entrada
    if (
      posEntrada.i >= 0 &&
      posEntrada.i < cols &&
      posEntrada.j >= 0 &&
      posEntrada.j < filas
    ) {
      let claveCelda = `(${posEntrada.i},${posEntrada.j})`;
      let celda = grilla[claveCelda];
      if (!celda.ocupada) {
        celda.ocupada = true;
        celda.casa = this; // Referencia a la casa
        celda.caminado = 40; // Valor de caminando para la entrada
        celda.colorRelleno = this.colorEntrance; // Mismo color que el aldeano
        this.celdas.push(posEntrada);
        this.celdaEntrada = celda; // Guardar referencia a la casilla de entrada
      }
    }
    this.crece();

 
  }

  crece() {
    // 1. Encontrar las celdas vecinas que no están ocupadas
    this.recurso_0 -= COSTO_EXPANSION_CASA; // Restar recursos
    if(this.recurso_0 >= COSTO_EXPANSION_CASA){
      this.crece();
    }
    let celdasVecinas = [];
    let posCeldas = new Set(this.celdas.map((pos) => `(${pos.i},${pos.j})`));

    // Desplazamientos solo en las direcciones cardinales (arriba, abajo, izquierda, derecha)
    let direcciones = [
      { di: -1, dj: 0 }, // arriba
      { di: 1, dj: 0 }, // abajo
      { di: 0, dj: -1 }, // izquierda
      { di: 0, dj: 1 }, // derecha
    ];

    for (let pos of this.celdas) {
      let i = pos.i;
      let j = pos.j;

      for (let { di, dj } of direcciones) {
        let ni = i + di;
        let nj = j + dj;
        if (ni >= 0 && ni < cols && nj >= 0 && nj < filas) {
          let claveVecina = `(${ni},${nj})`;
          if (!posCeldas.has(claveVecina)) {
            let celdaVecina = grilla[claveVecina];
            let maxDiffAltura = MAX_DIFF_ALTURA + this.celdas.length / 4;
            if (
              !celdaVecina.ocupada &&
              celdaVecina.caminado < MAX_CAMINADO &&
              Math.abs(
                celdaVecina.valores.altura - this.celdaEntrada.valores.altura
              ) <= maxDiffAltura
            ) {
              celdasVecinas.push(celdaVecina);
            }
          }
        }
      }
    }

    // 2. Seleccionar la casilla con menor valor de 'caminado'
    if (celdasVecinas.length > 0) {
      // Encontrar el valor mínimo de 'caminado'
      let minCaminado = Infinity;
      for (let celda of celdasVecinas) {
        if (celda.caminado < minCaminado) {
          minCaminado = celda.caminado;
        }
      }

      // Filtrar las casillas que tienen el valor mínimo de 'caminado'
      let filteredCeldas = celdasVecinas.filter(
        (cell) => cell.caminado === minCaminado
      );
      
      // En caso de empate, seleccionar la casilla con la distancia más corta a la celdaEntrada
      let celdaGanadora = filteredCeldas[0]; // Empezamos asumiendo que la primera es la ganadora
      let minDistancia = Infinity;
      
      const centroEntrada = this.celdaEntrada.centro(); // Obtener el centro de la casilla de entrada

      for (let celda of filteredCeldas) {
        let centroCelda = celda.centro();
        let distancia = dist(centroEntrada.x, centroEntrada.y, centroCelda.x, centroCelda.y);

        if (distancia < minDistancia) {
          minDistancia = distancia;
          celdaGanadora = celda;
        }
      }

      // 3. Agregar la casilla seleccionada a la casa y marcarla como ocupada
      let pos = { i: celdaGanadora.i, j: celdaGanadora.j };
      this.celdas.push(pos);
      celdaGanadora.ocupada = true;
      celdaGanadora.casa = this; // Referencia a la casa
      celdaGanadora.caminado = -100; // 
      celdaGanadora.colorRelleno = this.colorBase; // Establecer el color del techo
    } else {
      // No hay celdas vecinas libres, la casa pierde recursos
      this.recurso_0 -= COSTO_EXPANSION_CASA; // Restablecer recursos
    }

    if (this.celdas.length > 0) {
      for (let pos of this.celdas) {
        let celda = grilla[`(${pos.i},${pos.j})`];
        celda.caminado = -100;
      }
    }
  }


  reclamar(aldeano) {
    this.abandonada = false;
    this.colorEntrada = aldeano.clan;
    this.colorBase = lerpColor(
      this.colorEntrada,
      color(255, 255, 255, 5),
      0.5
    );
    this.necesitaRedibujar = true;
  }

  eliminaCelda() {
    let pos = this.celdas.pop(); // Elimina la última casilla (excepto la entrada)
    let celda = grilla[`(${pos.i},${pos.j})`];
    celda.ocupada = false;
    celda.casa = null;
    celda.actualizaColor();
  }

  handleAbandono() {
    if (this.abandonada) {
      this.tAbandonada++;
      if (this.tAbandonada % 10 === 0 && this.celdas.length > 3) {
        this.eliminaCelda(); // Elimina una casilla cada 30 frames
      }
    }
  }

  abandonar() {
    this.abandonada = true;
    this.colorEntrada = color(10, 10, 10, 90);
    this.colorBase = lerpColor(
      this.colorEntrada,
      color(255, 255, 255, 5),
      0.1
    );
    this.necesitaRedibujar = true;
  }
 // Método para redibujar el buffer si es necesario
 redibujaBuffer() {
  this.buffer.clear();
  this.buffer.push();
  this.buffer.translate(this.i * tamCelda, this.j * tamCelda);

  for (let pos of this.celdas) {
    let dx = (pos.i - this.i) * tamCelda;
    let dy = (pos.j - this.j) * tamCelda;
    let esEntrada = pos.i === this.celdaEntrada.i && pos.j === this.celdaEntrada.j;

    if (esEntrada) {
      this.buffer.fill(this.colorEntrada);
      this.buffer.stroke(0);
      this.buffer.strokeWeight(tamCelda * 0.25);
    } else {
      this.buffer.noStroke();
      this.buffer.fill(this.colorBase);
    }
    this.buffer.rect(dx, dy, tamCelda * 1.1, tamCelda * 1.1);
  }

  this.buffer.pop();
}
   // Método que dibuja la casa, utilizando el buffer si no hay cambios
   dibuja() {
    if (this.celdas.length !== this.numCeldas) {
      this.necesitaRedibujar = true;
      this.numCeldas = this.celdas.length;
    }

    if (this.necesitaRedibujar) {
      this.redibujaBuffer(); // Redibujar el buffer si es necesario
      this.necesitaRedibujar = false;
    }

    image(this.buffer, 0, 0); // Dibujar el buffer
  }
}
