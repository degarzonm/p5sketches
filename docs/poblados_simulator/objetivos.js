class Objetivo {
  constructor(id, x, y, energia, tamaño, tipo = "recorrido") {
    this.id = id;
    this.pos = createVector(x, y);
    this.energia = energia;
    this.tam = tamaño;
    this.tipo = tipo; // 'recorrido', 'recurso', 'casa'
  }

  dibuja(buffer) {
    buffer.fill(240, 120, 20);
    buffer.stroke(0, 120, 0);
    buffer.ellipse(this.pos.x, this.pos.y, this.tam * 2, this.tam * 2);
  }
}

function dibujaObjetivos(buffer) {
  buffer.clear();

  for (let objetivo of objetivos.values()) {
    objetivo.dibuja(buffer);
  }
}

function generarRecursos() {
  for (let i = 0; i < 10000; i++) {
    let x = random(width);
    let y = random(height);
    let id = generateUUID();
    let recurso = new Objetivo(id, x, y, 6, 5); //id,x,y Energía  , tamaño  
    objetivos.set(id, recurso);
  }

  // Si los aldeanos no tienen un objetivo, buscar uno nuevo
  for (let aldeano of aldeanos) {
    if (!aldeano.target) {
      aldeano.buscaObjetivo();
    }
  }
}

function eliminarRecursos() {
  // Limpiar todos los recursos del mapa
  objetivos.clear();

  // Limpiar el buffer de recursos
  buffers["recursos"].clear();

  // Actualizar la última cantidad de objetivos
  cantidadObjetivosTemp = 0;
}

function generarRecursosMonteCarlo(n) {
  let probabilidad = floor(random(100));
  for (let i = 0; i < n; i++) {
    let x = random(width);
    let y = random(height);
    let id = generateUUID();
    
    let celda = grilla[`(${floor(x / tamCelda)},${floor(y / tamCelda)})`];
    if (celda.valores.probabilidadRecurso > probabilidad) {
      // Generar un recurso
      
      let recurso = new Objetivo(id, x, y, 20, 5); 
      objetivos.set(id, recurso);
    }
  }
}
