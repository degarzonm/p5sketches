class UI {
    constructor() {
        this.herramienta = 0;

        this.herramientaButton = createButton("Crear localidad");
        this.generateUI();
    }

    generateUI() {
        this.herramientaButton.position(width+10, 10);
        this.herramientaButton.mousePressed(() => {
            this.herramienta = (this.herramienta + 1) % 3; // Ahora ciclos entre 0,1,2
            let nom;
            if (this.herramienta === 0) {
                nom = "Crear localidad";
            } else if (this.herramienta === 1) {
                nom = "Crear Camino";
            } else if (this.herramienta === 2) {
                nom = "Crear Bosque";
            }
            this.herramientaButton.html(nom);
          });
    }

}