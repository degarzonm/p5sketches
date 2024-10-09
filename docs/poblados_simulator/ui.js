class UI {
  constructor() {
    // Obtener el contenedor de la UI desde el DOM
    this.uiContainer = select('#ui-container');

    // Variables de estado de la UI
    this.herramienta = 0;
    this.mostrarCaminado = false;
    this.mostrarAreasRecursos = true;
    this.mostrarRecursos = true;
    this.mostrarRutasAldeanos = false;
    this.generacionRecursos = false;
    this.mostrarCasas = true;

    // Sliders y botones
    this.slider = {};
    this.nuevoCampoButton = createButton("Nuevo campo");
    this.herramientaButton = createButton("Camino");
    this.caminadoButton = createButton("Mostrar Caminos");
    this.areaRecursosButton = createButton("Mostrar Areas Recursos");
    this.mostrarRutasButton = createButton("Mostrar Rutas Aldeanos");
    this.agregarAldeanosButton = createButton("Agregar 5 aldeanos");
    this.eliminarAldeanosButton = createButton("Eliminar Aldeanos");
    this.generarRecursosButton = createButton("Agregar 20 recursos");
    this.activaGeneracionRecursosButton = createButton("Generación de recursos");
    this.eliminarRecursosButton = createButton("Eliminar Recursos");
    this.mostrarRecursosButton = createButton("Mostrar/Ocultar recursos");
    this.mostrarCasasButton = createButton("Mostrar Casas");
    this.resetVistaButton = createButton("Reiniciar Vista");

    this.generateUI();
  }

  generateUI() {
    // Sliders para control de caminos
    this.slider["factorEnergia"] = createSlider(0, 0.1, 0.02, 0.01);
    this.slider["factorDistancia"] = createSlider(0, 1, 0.9, 0.01);
    this.slider["factorCamino"] = createSlider(0, 1, 0.01, 0.01);

    // Añadir sliders al contenedor
    this.uiContainer.child(this.slider["factorEnergia"]);
    this.uiContainer.child(this.slider["factorDistancia"]);
    this.uiContainer.child(this.slider["factorCamino"]);

    // Añadir botones al contenedor de UI
    this.uiContainer.child(this.nuevoCampoButton);
    this.uiContainer.child(this.resetVistaButton);
    this.uiContainer.child(this.generarRecursosButton);
    this.uiContainer.child(this.activaGeneracionRecursosButton);
    this.uiContainer.child(this.mostrarRecursosButton);
    this.uiContainer.child(this.eliminarRecursosButton);
    this.uiContainer.child(this.agregarAldeanosButton);
    this.uiContainer.child(this.eliminarAldeanosButton);
    this.uiContainer.child(this.mostrarCasasButton);
    this.uiContainer.child(this.caminadoButton);
    this.uiContainer.child(this.areaRecursosButton);
    this.uiContainer.child(this.mostrarRutasButton);
    this.uiContainer.child(this.herramientaButton);

    // Funcionalidad de los botones y sliders
    this.nuevoCampoButton.mousePressed(() => {
      iniciaGrilla(buffers); // Redibujar la grilla en el buffer
      if (posInicio && posFin) {
        path = calculaCamino(
          posInicio,
          posFin,
          this.slider["factorEnergia"].value(),
          this.slider["factorDistancia"].value(),
          this.slider["factorCamino"].value()
        );
      }
    });

    this.resetVistaButton.mousePressed(() => Controls.resetView());

    this.generarRecursosButton.mousePressed(generarRecursos);

    this.activaGeneracionRecursosButton.mousePressed(() => {
      this.generacionRecursos = !this.generacionRecursos;
      let label = this.generacionRecursos ? "Generación de recursos ON" : "Generación de recursos OFF";
      this.activaGeneracionRecursosButton.html(label);
    });

    this.mostrarRecursosButton.mousePressed(() => {
      this.mostrarRecursos = !this.mostrarRecursos;
    });

    this.eliminarRecursosButton.mousePressed(eliminarRecursos);

    this.agregarAldeanosButton.mousePressed(agregarAldeanos);

    this.eliminarAldeanosButton.mousePressed(eliminarAldeanos);

    this.mostrarCasasButton.mousePressed(() => {
      this.mostrarCasas = !this.mostrarCasas;
    });

    this.caminadoButton.mousePressed(() => {
      this.mostrarCaminado = !this.mostrarCaminado;
      this.mostrarAreasRecursos = false;
      let label = this.mostrarCaminado ? "Ocultar caminos" : "Mostrar caminos";
      this.caminadoButton.html(label);
      dibujaCaminados(buffers.caminado);
    });

    this.areaRecursosButton.mousePressed(() => {
      this.mostrarAreasRecursos = !this.mostrarAreasRecursos;
      this.mostrarCaminado = false;
      let label = this.mostrarAreasRecursos ? "Ocultar areas recursos" : "Mostrar areas recursos";
      this.areaRecursosButton.html(label);
    });

    this.mostrarRutasButton.mousePressed(() => {
      this.mostrarRutasAldeanos = !this.mostrarRutasAldeanos;
      let label = this.mostrarRutasAldeanos ? "Ocultar rutas aldeanos" : "Mostrar rutas aldeanos";
      this.mostrarRutasButton.html(label);
    });

    this.herramientaButton.mousePressed(() => {
      this.herramienta = (this.herramienta + 1) % 3;
      let nom = this.herramienta === 0 ? "Caminos" : this.herramienta === 1 ? "Recursos" : "Aldeano";
      this.herramientaButton.html(nom);
    });
  }
}
