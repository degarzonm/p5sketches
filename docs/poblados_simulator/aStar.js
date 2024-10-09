// Función para calcular el camino utilizando A* entre los puntos A y B, retorna una lista con las casillas que componen el camino

function calculaCamino(
  inicio,
  destino,
  factorEnergía,
  factorDistancia,
  factorCamino
) {
  // Inicializar estructuras temporales
  let minHeap = new MinHeap();
  let visitados = new Set();

  // la grilla utiliza (i, j) como llave de su diccionario para obtener la celda
  let claveInicio = `(${inicio.i},${inicio.j})`;
  let claveDestino = `(${destino.i},${destino.j})`;

  // Agregar la casilla inicial al minHeap
  minHeap.push({ camino: [grilla[claveInicio]] }, 0);

  while (minHeap.size() > 0) {
    // Tomar la lista con menor valor de heap
    let actual = minHeap.pop();
    let caminoActual = actual.camino;
    let celdaActual = caminoActual[caminoActual.length - 1];
    let claveActual = `(${celdaActual.i},${celdaActual.j})`;

    // Verificar si hemos llegado a la casilla destino
    if (esDestino(celdaActual, destino)) {
      return caminoActual;
    }

    // Marcar la casilla como visitada
    visitados.add(claveActual);

    // Evaluar las 8 casillas vecinas
    let vecinos = obtenerVecinos(celdaActual);
    for (let vecino of vecinos) {
      let claveVecino = `(${vecino.i},${vecino.j})`;
      if (!visitados.has(claveVecino)) {
        let nuevoCamino = caminoActual.slice(); // Copiar la lista actual
        nuevoCamino.push(vecino); // Agregar la casilla vecina

        let prioridad = calcularPrioridad(
          celdaActual,
          vecino,
          destino,
          factorEnergía,
          factorDistancia,
          factorCamino
        ); // Calcular la prioridad con la nueva función
        minHeap.push({ camino: nuevoCamino }, prioridad); // Agregar la nueva lista al minHeap con su prioridad
      }
    }
  }

  // Retornar un camino vacío si no se encuentra ninguno
  return [];
}

// Función para verificar si una casilla cumple la condición de ser el destino
function esDestino(celda, destino) {
  return celda.i === destino.i && celda.j === destino.j;
}

// Función que calcula el valor de heap basado en la diferencia de altura, la distancia y el valor caminado acumulado en la celda
function calcularPrioridad(
  celdaActual,
  vecino,
  destino,
  factorEnergía,
  factorDistancia,
  factorCamino
) {
  // Calcular la energía
  let energia =
    Math.abs(vecino.valores.altura - celdaActual.valores.altura) / MAX_ALTURA;

  // Calcular la distancia
  let dx = destino.i - vecino.i;
  let dy = destino.j - vecino.j;
  let distancia =
    Math.sqrt(dx * dx + dy * dy) / Math.sqrt(width * width + height * height);

  // Calcular el camino
  let camino = Math.abs(vecino.caminado) / (100 - maxCaminadoTemp);

  // Multiplicaciones de cada componente
  let componenteEnergía = factorEnergía * energia * 10000;
  let componenteDistancia = factorDistancia * distancia * 10000;
  let componenteCamino = factorCamino * camino;

  // Calcular la prioridad final
  let prioridadFinal =
    componenteEnergía + componenteDistancia + componenteCamino;

  return prioridadFinal;
}

function dibujaCamino(camino) {
  // Pintar el camino con un degradado de verde a rojo
  let tamCamino = camino.length;
  for (let i = 0; i < tamCamino; i++) {
    let t = i / tamCamino;
    let r = lerp(0, 255, t);
    let g = lerp(120, 20, t);
    let b = lerp(255, 0, t);
    fill(r, g, b, 0);
    let cell = camino[i];
    stroke(g, b, r);
    strokeWeight(1);
    rect(cell.x, cell.y, tamCelda, tamCelda);
  }

  if (posInicio) {
    fill(0, 255, 0);
    ellipse(
      posInicio.i * tamCelda + tamCelda / 2,
      posInicio.j * tamCelda + tamCelda / 2,
      tamCelda / 2
    );
  }
  if (posFinal) {
    fill(255, 0, 0);
    ellipse(
      posFinal.i * tamCelda + tamCelda / 2,
      posFinal.j * tamCelda + tamCelda / 2,
      tamCelda / 2
    );
  }
}
