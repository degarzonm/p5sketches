class UI {
  constructor() {
    //UI
    this.herramienta = 0;
    this.mostrarCaminado = false;
    this.mostrarAreasRecursos = true;
    this.mostrarRecursos = true;
    this.mostrarRutasAldeanos = false;
    this.generacionRecursos=false;

    this.mostrarCasas = true; // TO DO
    this.slider = {};

    this.nuevoCampoButton = createButton("Nuevo campo");
    this.herramientaButton = createButton("Camino");
    this.caminadoButton = createButton("Mostrar Caminos");
    this.areaRecursosButton = createButton("Mostrar Areas Recursos");
    this.mostrarRutasButton = createButton("Mostrar Rutas Aldeanos");

    this.agregarAldeanosButton = createButton("Agregar 5 aldeanos");
    this.eliminarAldeanosButton = createButton("Eliminar Aldeanos"); // Nuevo botón

    this.generarRecursosButton = createButton("Agregar 20 recursos");
    this.activaGeneracionRecursosButton = createButton("Generación de recursos");
    this.eliminarRecursosButton = createButton("Eliminar Recursos");
    this.mostrarRecursosButton = createButton("Muestra/Oculta recusos");
    this.mostrarCasasButton = createButton("Mostrar Casas");
    this.resetVistaButton = createButton("Reiniciar Vista");

    this.generateUI();
  }

  generateUI() {
    this.slider["factorEnergia"] = createSlider(0, 0.1, 0.02, 0.01);
    this.slider["factorEnergia"].position(10, height + 10);
    this.slider["factorEnergia"].style("width", "40px");
    this.slider["factorEnergia"].mouseReleased(actualizaCamino);

    this.slider["factorDistancia"] = createSlider(0, 1, 0.9, 0.01);
    this.slider["factorDistancia"].position(50, height + 10);
    this.slider["factorDistancia"].style("width", "40px");
    this.slider["factorDistancia"].mouseReleased(actualizaCamino);

    this.slider["factorCamino"] = createSlider(0, 1, 0.01, 0.01);
    this.slider["factorCamino"].position(90, height + 10);
    this.slider["factorCamino"].style("width", "40px");
    this.slider["factorCamino"].mouseReleased(actualizaCamino);

    // Crear el botón

    this.nuevoCampoButton.position(0, height + 30);
    this.nuevoCampoButton.mousePressed(() => {
      iniciaGrilla(buffers); // Redibujar el grilla en el buffer
      if (posInicio && posFin) {
        //console.log("updating path");
        path = calculaCamino(
          posInicio,
          posFin,
          this.slider["factorEnergia"].value(),
          this.slider["factorDistancia"].value(),
          this.slider["factorCamino"].value()
        );
      }
    });

    this.resetVistaButton.position(0, height + 70); // Ajusta la posición según tu diseño
    this.resetVistaButton.mousePressed(() => {
      Controls.resetView();
    });

    
    this.generarRecursosButton.position(150 , height + 10);
    this.generarRecursosButton.mousePressed(generarRecursos);

    this.activaGeneracionRecursosButton.position(320, height + 40);
    this.activaGeneracionRecursosButton.mousePressed(() => {
      this.generacionRecursos = !this.generacionRecursos;
      let label = this.generacionRecursos ? "Generación de recursos ON" : "Generación de recursos OFF";
      this.activaGeneracionRecursosButton.html(label);
    });


    this.mostrarRecursosButton.position(150, height + 40); // Justo debajo del botón "Agregar 20 recursos"
    this.mostrarRecursosButton.mousePressed(() => {
      this.mostrarRecursos = !this.mostrarRecursos;
    });
    
    this.eliminarRecursosButton.position(320, height + 10); // Justo debajo del botón "Agregar 20 recursos"
    this.eliminarRecursosButton.mousePressed(eliminarRecursos);
    
    


    this.agregarAldeanosButton.position(520, height + 10);
    this.agregarAldeanosButton.mousePressed(agregarAldeanos);
    
    this.eliminarAldeanosButton.position(520, height + 40);
    this.eliminarAldeanosButton.mousePressed(() => {
      eliminarAldeanos(); 
    });
   
    
    this.mostrarCasasButton.position(720, height + 40);
    this.mostrarCasasButton.mousePressed(() => {
      this.mostrarCasas = !this.mostrarCasas;
    });

    
    
    // Botón para mostrar/ocultar "caminado"
    this.caminadoButton.position(width - 300, height + 10);
    this.caminadoButton.mousePressed(() => {
      this.mostrarCaminado = !this.mostrarCaminado; // Cambiar el estado de la visualización
      this.mostrarAreasRecursos = false; // Ocultar las áreas de recursos
      let label = this.mostrarCaminado ? "Ocultar caminos" : "Mostrar caminos";
      this.caminadoButton.html(label);
      dibujaCaminados(buffers.caminado); // Redibujar el grilla con la nueva visualización
    });
    
    this.areaRecursosButton.position(width - 300, height + 40);
    this.areaRecursosButton.mousePressed(() => {
      this.mostrarAreasRecursos = !this.mostrarAreasRecursos;
      this.mostrarCaminado = false; // Ocultar los caminos
      let label = this.mostrarAreasRecursos ? "Ocultar areas recursos" : "Mostrar areas recursos";
      this.areaRecursosButton.html(label);
      //dibujaAreaRecursos(buffers.area_recursos); // Redibujar el grilla con la nueva visualización
    });
    
    this.mostrarRutasButton.position(width - 300, height + 70);
    this.mostrarRutasButton.mousePressed(() => {
      this.mostrarRutasAldeanos = !this.mostrarRutasAldeanos;
      let label = this.mostrarRutasAldeanos ? "Ocultar rutas aldeanos" : "Mostrar rutas aldeanos";
      this.mostrarRutasButton.html(label);
    });



    this.herramientaButton.position(width - 120, height + 10);
    this.herramientaButton.mousePressed(() => {
      this.herramienta = (this.herramienta + 1) % 3; // Cambiar a 3 modos
      let nom =
        this.herramienta == 0
          ? "Caminos"
          : this.herramienta == 1
          ? "Recursos"
          : "Aldeano";
      this.herramientaButton.html(nom);
    });

    
  }
}
