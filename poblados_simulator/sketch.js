let cnv;

let MAX_ALTURA = 1000;
let MAX_DIFF_ALTURA = 50;
let MAX_CAMINADO = 7;
let COSTO_EXPANSION_CASA = 5;
let COSTO_CONSTRUCCION_CASA = 20;
let grilla = {};
let cols, filas;
let tamCelda = 10;
//zoom controls
const controls = {
  view: { x: 0, y: 0, zoom: 1 },
  viewPos: { prevX: null, prevY: null, isDragging: false },
};

let caminoDummy = [];
let posInicio = null;
let posFinal = null;

let aldeanos = []; // Lista global de aldeanos
let objetivos = new Map();
let cantidadObjetivosTemp;
let casas = [];

let pausa = false;
let ui;

let buffers = {}; // Buffer para dibujar el grilla

function setup() {
  cnv = createCanvas(1200, 800);
  //zooom zoom
  // Attach the mouseWheel event listener to the canvas element
  cnv.elt.addEventListener("wheel", (e) => {
    Controls.zoom(controls).worldZoom(e);
  });
  cnv.elt.addEventListener("contextmenu", (e) => e.preventDefault());

  cols = width / tamCelda;
  filas = height / tamCelda;

  // Crear el buffer
  buffers["altura"] = createGraphics(width, height);
  buffers["caminado"] = createGraphics(width, height);
  buffers["recursos"] = createGraphics(width, height);
  buffers["area_recursos"] = createGraphics(width, height);
  buffers["casas"] = createGraphics(width, height); // TO DO
  // Crear interfaz de usuario
  ui = new UI();
  // Crear la matriz de casillas organizada como un diccionario
  iniciaGrilla(buffers);

  // Log para verificar la estructura de datos
  //console.log(grilla);
}

function draw() {
  translate(controls.view.x, controls.view.y);
  scale(controls.view.zoom);
  if (!pausa) {
    background(220);

    // Mostrar el buffer de altura del terreno si no estan activos los otros

    image(buffers["altura"], 0, 0);

    // Mostrar el buffer de 'caminado' si está activo
    if (ui.mostrarCaminado) {
      image(buffers["caminado"], 0, 0);
    }

    // Mostrar el buffer de 'áreas de recursos' si está activo
    if (ui.mostrarAreasRecursos) {
      image(buffers["area_recursos"], 0, 0);
    }

    //
    //dibujaCamino(caminoDummy);

    if (ui.mostrarCasas) {
      for (let casa of casas) {
        casa.handleAbandono();
        casa.dibuja();
      }
    }
    if (ui.mostrarRecursos) {
      image(buffers["recursos"], 0, 0);
    }
    // Actualizar y mostrar aldeanos

    if (ui.mostrarRutasAldeanos) {
      for (let aldeano of aldeanos) {
        dibujaCamino(aldeano.ruta);
      }
    }

    for (let aldeano of aldeanos) {
      aldeano.actualiza();
      aldeano.dibuja();
    }

    if (ui.generacionRecursos && objetivos.size < 600) {
      generarRecursosMonteCarlo(31);
    }

    // Actualizar recursos si es necesario
    if (ui.mostrarRecursos) {
      redibujaObjetivos(frameCount);
    }
  }
}

function redibujaObjetivos(x) {
  if (objetivos.size != cantidadObjetivosTemp && frameCount % 30 == 0) {
    cantidadObjetivosTemp = objetivos.size;
    // Dibujar recursos
    dibujaObjetivos(buffers.recursos);
  }
}

function actualizaCamino() {
  if (posInicio && posFinal) {
    // console.log("updating path");
    caminoDummy = calculaCamino(
      posInicio,
      posFinal,
      ui.slider["factorEnergia"].value(),
      ui.slider["factorDistancia"].value(),
      ui.slider["factorCamino"].value()
    );
  }
}

function mousePressed(e) {
  if (mouseButton === LEFT) {
    // Verifica si es clic izquierdo
    // Convertir las coordenadas de la pantalla a las coordenadas del mundo
    let worldX = (mouseX - controls.view.x) / controls.view.zoom;
    let worldY = (mouseY - controls.view.y) / controls.view.zoom;

    // Calcular los índices de la grilla basados en las coordenadas del mundo
    let index_i = floor(worldX / tamCelda);
    let index_j = floor(worldY / tamCelda);

    if (index_i >= 0 && index_i < cols && index_j >= 0 && index_j < filas) {
      if (ui.herramienta == 0) {
        // Funcionalidad de caminos

        if (aldeanos.length == 0) {
          let teamColor = color(random(255), random(255), random(255));
          let aldeano = new Aldeano(worldX, worldY, teamColor, 3, 0.15);
          aldeanos.push(aldeano);

          posInicio = { i: index_i, j: index_j };
        } else {
          if (!posInicio) {
            let celdaAct =
              grilla[
                `(${floor(aldeanos[0].pos.x / tamCelda)},${floor(
                  aldeanos[0].pos.y / tamCelda
                )})`
              ];
            posInicio = { i: celdaAct.i, j: celdaAct.j };
          }
          posFinal = { i: index_i, j: index_j };
          caminoDummy = calculaCamino(
            posInicio,
            posFinal,
            ui.slider["factorEnergia"].value(),
            ui.slider["factorDistancia"].value(),
            ui.slider["factorCamino"].value()
          );
          posInicio = posFinal;

          let celdaDestino = { i: index_i, j: index_j };
          for (let aldeano of aldeanos) {
            aldeano.iniciaCaminos();
            let celdaIni =
              grilla[
                `(${floor(aldeano.pos.x / tamCelda)},${floor(
                  aldeano.pos.y / tamCelda
                )})`
              ];

            aldeano.ruta = calculaCamino(
              { i: celdaIni.i, j: celdaIni.j },
              celdaDestino,
              ui.slider["factorEnergia"].value(),
              ui.slider["factorDistancia"].value(),
              ui.slider["factorCamino"].value()
            );
            aldeano.estableceObjetivos(aldeano.ruta);
          }
        }
      } else if (ui.herramienta == 1) {
        // Modo de recursos

        let id = generateUUID();
        let recurso = new Objetivo(id, worldX, worldY, 5, 5); // Energía 1, tamaño 5
        objetivos.set(id, recurso);

        for (let aldeano of aldeanos) {
          if (!aldeano.objetivo) {
            aldeano.iniciaCaminos();
            aldeano.buscaObjetivo();
          }
        }
      } else if (ui.herramienta == 2) {
        // Modo de agregar Aldeano
        let colorClan = color(random(255), random(255), random(255));
        let aldeano = new Aldeano(worldX, worldY, colorClan, 3, 0.15);
        aldeanos.push(aldeano);

        // Iniciar búsqueda de objetivo inmediatamente
        aldeano.buscaObjetivo();
      }
    }
  } else if (mouseButton === CENTER) {
    {
      console.log("middle mouse button pressed");
      Controls.move(controls).mousePressed(e);
    }
  }
}

function mouseDragged(e) {
  if (mouseButton === CENTER) {
    // Check if the middle mouse button is used for dragging
    Controls.move(controls).mouseDragged(e);
  }
}

function mouseReleased(e) {
  if (mouseButton === CENTER) {
    // Check if the middle mouse button is released
    Controls.move(controls).mouseReleased(e);
  }
}
