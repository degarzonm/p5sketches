let maxCaminadoTemp = 0;
let NOISE_DETAIL_ALTURA = 3;
let NOISE_DETAIL_RECURSOS = 0.1;

let NOISE_FALLOFF_ALTURA = 0.8;
let NOISE_FALLOFF_RECURSOS = 0.2;

//inicializa la estructura de control de las casillas
function iniciaGrilla(buffers) {
  // Parámetros para la altura del terreno
 
  let escalaTerreno = 0.06;
  let escalaOffsetTerreno = random(0, 10000);

  // Parámetros para la probabilidad de recurso
  let escalaRecursos = 0.06;
  let escalaOffsetRecursos = random(0, 10000);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < filas; j++) {
      let clave = `(${i},${j})`;
      noiseDetail(NOISE_DETAIL_ALTURA, NOISE_FALLOFF_ALTURA);
      // Generar altura del terreno
      let altura = noise(i * escalaTerreno + escalaOffsetTerreno, j * escalaTerreno + escalaOffsetTerreno) * MAX_ALTURA;
      
      noiseDetail(NOISE_DETAIL_RECURSOS, NOISE_FALLOFF_RECURSOS);
      // Generar probabilidad de recurso
      let probabilidadRecurso = floor(100*noise(i * escalaRecursos + escalaOffsetRecursos, j * escalaRecursos + escalaOffsetRecursos))-10;

      grilla[clave] = new Casilla(
        i * tamCelda,
        j * tamCelda,
        i,
        j,
        tamCelda,
        {
          altura: altura,
          probabilidadRecurso: probabilidadRecurso 
        }
      );
    }
  }
  dibujaAlturas(buffers.altura); // Dibujar la grilla en el buffer al inicializar
  dibujaAreaRecursos(buffers.area_recursos);
}

function dibujaAlturas(buffer) {
  buffer.clear();
  for (let clave in grilla) {
    grilla[clave].dibujaAltura(buffer);
  }
}

function dibujaCaminados(buffer) {
  buffer.clear();

  // Calcular maxCaminadoTemp para normalizar
  maxCaminadoTemp = 0;
  for (let clave in grilla) {
    if (grilla[clave].caminado > maxCaminadoTemp) {
      maxCaminadoTemp = grilla[clave].caminado;
    }
  }

  for (let clave in grilla) {
    grilla[clave].dibujaCaminado(buffer, maxCaminadoTemp);
  }
}

function dibujaAreaRecursos(buffer) {
  buffer.clear();
  for (let clave in grilla) {
    grilla[clave].dibujaProbRecursos(buffer);
  }
}

// Función para obtener los vecinos de una casilla
function obtenerVecinos(celda) {
  let celdasVecinas = [];
  for (let di = -1; di <= 1; di++) {
    for (let dj = -1; dj <= 1; dj++) {
      if (di != 0 || dj != 0) {
        let i = celda.i + di;
        let j = celda.j + dj;
        if (i >= 0 && i < cols && j >= 0 && j < filas) {
          celdasVecinas.push(grilla[`(${i},${j})`]);
        }
      }
    }
  }
  return celdasVecinas;
}
