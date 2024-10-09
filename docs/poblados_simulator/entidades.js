class Aldeano {
  constructor(x, y, clan, maxVel, maxFuerza) {
    this.clan = clan;
    this.tam = 7;
    this.areaBusqueda = 200;
    this.radioTomar = 10;
    this.capacidadCarga = 100;

    this.distDesacelera = 20;
    this.energia = 255;
    this.colorVida = color(this.energia, 0, 0);
    

    this.maxVel = maxVel;
    this.maxFuerza = maxFuerza;
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acel = createVector(0, 0);
    this.angulo = 0;

    this.celdaActual = null;
    this.tEnCelda = 0;

    this.iniciaCaminos();

    this.recurso_0 = 0;  // Recursos recolectados
    this.casa = null; // Referencia a la casa del aldeano
    this.objetivoRecurso = null; // Referencia al recurso actual
    this.objetivo = null; // Objetivo actual
    this.caminoObjetivos = [];   // lista de objetivos a seguir
    this.ruta = []; // Ruta actual de casillas
  }

  actualiza() {
    this.recorreCamino();
    this.cinematica();
    this.miraFronteras();
    this.capturaObjetivo();
    this.actualizaCaminado();

    this.energia -= 0.1 + this.vel.mag() * 0.1;
    this.colorVida = color(this.energia, 0, 0);

    // Verificar si necesita buscar un nuevo recurso
    if (this.objetivo == null && this.caminoObjetivos.length == 0) {
      this.pensarQueHacer();
    }
  }

  iniciaCaminos(){
    this.caminoObjetivos = [];
    this.objetivo = null;
    this.ruta = [];
  }

  pensarQueHacer() {
    if (this.casa && this.recurso_0 >= this.capacidadCarga) {
      this.caminoaCasa();
    } else {
      this.buscaObjetivo();
    }
  }

  actualizaCaminado() {
    // Determinar en qué casilla está el aldeano
    let i = floor(this.pos.x / tamCelda);
    let j = floor(this.pos.y / tamCelda);

    if (i >= 0 && i < cols && j >= 0 && j < filas) {
      let clave = `(${i},${j})`;
      let celda = grilla[clave];

      if (this.celdaActual === celda) {
        this.tEnCelda += 1;
      } else {
        this.celdaActual = celda;
        this.tEnCelda = 0;
      }

      // Actualizar el atributo "caminado" de la casilla
      if (celda.caminado < 1000) celda.caminado += 1 / (this.tEnCelda + 1);
    }
  }

  estableceObjetivos(camino) {
    for (let i = 0; i < camino.length; i++) {
      this.caminoObjetivos.push(
        new Objetivo(
          0,
          camino[i].centro().x,
          camino[i].centro().y,
          0,
          0,
        )
      );
    }
  }

  aplicaFuerza(fuerza) {
    this.acel.add(fuerza);
  }

  cinematica() {
    this.vel.add(this.acel);
    this.vel.limit(this.maxVel);

    this.pos.add(this.vel);

    if (this.vel.mag() > 0.01) {
      this.angulo = this.vel.heading();
    }

    this.acel.mult(0);
  }

  capturaObjetivo() {
    if (
      this.objetivo &&
      this.pos.dist(this.objetivo.pos) < this.radioTomar
    ) {
      this.vel.mult(0.8); // Frena al llegar al objetivo, actualizado cada frame, se reduce en 20%

      if (this.objetivo.tipo === "recurso") {
        // Incrementar el recurso del aldeano
        if (objetivos.get(this.objetivo.id)) {
          this.recurso_0 += objetivos.get(this.objetivo.id).energia;

          // Eliminar el recurso del mapa

          objetivos.get(this.objetivo.id).tam = 0;
          objetivos.get(this.objetivo.id).energia = 0;
          objetivos.delete(this.objetivo.id);
        } else {
          this.pensarQueHacer();
        }
        // Verificar si debe construir una casa
        if (this.recurso_0 >= COSTO_CONSTRUCCION_CASA && this.casa == null) {
          if (!this.getCeldaActual().ocupada) {
            if (this.getCeldaActual().caminado < MAX_CAMINADO) {
              this.creaCasa();
            }
          } else if (this.getCeldaActual().casa.abandonada) {
            this.casa = this.getCeldaActual().casa;
            this.casa.reclamar(this);
          } else {
            this.recurso_0--;
          }
        }
      } else if (this.objetivo.tipo === "casa") {
        // Llegó a la casa, almacenar recursos
        this.guardaRecursos();
      }

      this.objetivo = null;
    }
  }

  getCeldaActual() {
    let i = floor(this.pos.x / tamCelda);
    let j = floor(this.pos.y / tamCelda);

    return grilla[`(${i},${j})`];
  }

  miraFronteras() {
    if (this.pos.x > width) this.vel.x = 0;
    if (this.pos.x < 0) this.vel.x = 0;
    if (this.pos.y > height) this.vel.y = 0;
    if (this.pos.y < 0) this.vel.y = 0;
  }

  recorreCamino() {
    if (this.objetivo) { // Si hay un objetivo actual entonces apuntar hacia él
      let posDeseada = p5.Vector.sub(this.objetivo.pos, this.pos);
      let distancia = posDeseada.mag();

      if (distancia < this.distDesacelera) { // Desacelerar si está cerca del objetivo
        let m = map(distancia, 0, this.distDesacelera, 0, this.maxVel);
        posDeseada.setMag(m);
      } else {
        posDeseada.setMag(this.maxVel);
      }

      let fuerzaGirar = p5.Vector.sub(posDeseada, this.vel); // Fuerza para girar hacia el objetivo
      fuerzaGirar.limit(this.maxFuerza);
      this.aplicaFuerza(fuerzaGirar);
    } else if (this.caminoObjetivos.length > 0) {
      this.objetivo = this.caminoObjetivos.shift();
      this.ruta.shift();
      } else {
      // Detenerse suavemente cuando no hay objetivos
      let desacel = 0.8;
      this.vel.mult(desacel);
      if (this.vel.mag() < 0.1) {
        this.vel.set(0, 0);
      }
      // Buscar un nuevo objetivo si no hay ninguno
      if (this.recurso_0 > 0 && this.casa != null) {
        this.caminoaCasa();
      } else {
        this.buscaObjetivo();
      }
    }
  }

  buscaObjetivo() {
    let minDist = Infinity;
    let objetivoCercano = null;

    for (let objetivo of objetivos.values()) {
      let d = this.pos.dist(objetivo.pos);
      if (d < this.areaBusqueda && d < minDist) {
        minDist = d;
        objetivoCercano = objetivo;
      }
    }

    if (objetivoCercano) {
      // Calcular ruta hacia el recurso
      let celdaInicio =
        grilla[
          `(${floor(this.pos.x / tamCelda)},${floor(
            this.pos.y / tamCelda
          )})`
        ];
      let celdaFin =
        grilla[
          `(${floor(objetivoCercano.pos.x / tamCelda)},${floor(
            objetivoCercano.pos.y / tamCelda
          )})`
        ];

      this.ruta = calculaCamino(
        { i: celdaInicio.i, j: celdaInicio.j },
        { i: celdaFin.i, j: celdaFin.j },
        ui.slider["factorEnergia"].value(),
        ui.slider["factorDistancia"].value(),
        ui.slider["factorCamino"].value()
      );

      this.estableceObjetivos(this.ruta);

      // Agregar el recurso como el último objetivo
      this.caminoObjetivos.push(
        new Objetivo(
          objetivoCercano.id,
          objetivoCercano.pos.x,
          objetivoCercano.pos.y,
          objetivoCercano.energia,
          objetivoCercano.tam,
          "recurso" // Especificar el tipo
        )
      );

      // Guardar referencia al recurso
      this.objetivoRecurso = objetivoCercano;

      // Asegurarse de que el aldeano siga la ruta
      this.objetivo = null;
    }
  }

  caminoaCasa() {
    let celdaInicio =
      grilla[
        `(${floor(this.pos.x / tamCelda)},${floor(
          this.pos.y / tamCelda
        )})`
      ];
    let celdaFin = this.casa.celdaEntrada; // Usar la casilla de entrada

    if (celdaFin) {
      this.ruta = calculaCamino(
        { i: celdaInicio.i, j: celdaInicio.j },
        { i: celdaFin.i, j: celdaFin.j },
        ui.slider["factorEnergia"].value(),
        ui.slider["factorDistancia"].value(),
        ui.slider["factorCamino"].value()
      );

      this.estableceObjetivos(this.ruta);

      // Agregar la entrada de la casa como el último objetivo
      let posEntrada = celdaFin.centro();
      this.caminoObjetivos.push(
        new Objetivo(0, posEntrada.x, posEntrada.y, 0, 0, "casa")
      );

      this.objetivo = null;
    }
  }

  enCasa() {
    let posEntrada = this.casa.celdaEntrada.centro();
    return (
      dist(
        this.pos.x,
        this.pos.y,
        posEntrada.x,
        posEntrada.y
      ) < this.radioTomar
    );
  }

  creaCasa() {
    let i = floor(this.pos.x / tamCelda);
    let j = floor(this.pos.y / tamCelda);
    this.casa = new Casa(i, j, this.clan);
    casas.push(this.casa);
  }

  guardaRecursos() {
    if (this.recurso_0 > 0) {
      // console.log("storing resources")
      this.casa.actualiza(this.recurso_0);
      this.recurso_0 = 0;
      this.objetivo = null;
      this.buscaObjetivo(); // Buscar nuevos recursos
    }
  }

  reproduce(pareja) {
   // to do
  }

  morir() {
    // Si el aldeano tiene una casa, desconectarse de ella
    if (this.casa) {
      this.casa.ocupantes = this.casa.ocupantes.filter(
        (ocupante) => ocupante !== this
      );
      if (this.casa.ocupantes.length === 0) {
        this.casa.abandonar();
      }
    }
    // Eliminar al aldeano de la lista global de aldeanos
    aldeanos = aldeanos.filter((a) => a !== this);
  }

  dibuja() {
    fill(this.clan);
    stroke(11, 0, 0, 200);
    strokeWeight(0.3);
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angulo);
    ellipse(0, 0, this.tam, this.tam);
    fill(0, 0, 0, 0);
    stroke(this.clan);
    //ellipse(0, 0, this.senseArea, this.senseArea);
    stroke(this.colorVida);
    strokeWeight(1);
    line(0, 0, 8, 0);
    pop();
     
  }
}

function agregarAldeanos() {
  for (let i = 0; i < 50 ; i++) {
    let x = random(width);
    let y = random(height);
    let teamColor = color(random(255), random(255), random(255));
    let aldeano = new Aldeano(x, y, teamColor, 3, 0.5);
    aldeanos.push(aldeano);
  }
}

function eliminarAldeanos() {
  for (let aldeano of aldeanos) {
    aldeano.morir(); // Llama al método morir de cada aldeano
  }
}
