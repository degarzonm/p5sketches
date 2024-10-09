// Definición de la clase Casilla
class Casilla {
  
  constructor(x, y, i, j,  tamaño, valores) {
    this.x = x;
    this.y = y;
    this.i = i;
    this.j = j; 
    
    this.tam = tamaño;
    this.valores = valores;
    this.info = false;
    this.caminado = 1; 
    this.ocupada = false;
    this.casa = null; 
    this.colorRelleno = color(255);
    this.actualizaColor();
  }

  centro() {
    return { x: this.x + this.tam / 2, y: this.y + this.tam / 2 };
  }
  
  actualizaColor() {
    // Definir los umbrales de altura
    const azulm = 100;
    const verde1m = 250;
    const verde2m = 500;
    const cafem = 750;
    const blancom = 1000;

    // Definir los colores para cada rango de tiempo
    const colorAzulOscuro = color(0, 0, 139);
    const colorAzulClaro = color(173, 216, 230);
    const colorVerdeOscuro = color(0, 128, 0);
    const colorVerdeClaro = color(34, 139, 34);
    const colorCafe = color(139, 69, 19);
    const colorBlanco = color(255, 250, 250);

    // Obtener el valor de tiempo
    let altura = this.valores.altura;

    // Asignar el color correspondiente basado en el valor de tiempo
    if (altura <= azulm) {
      this.colorRelleno = lerpColor(
        colorAzulOscuro,
        colorAzulClaro,
        altura / azulm
      );
    } else if (altura <= verde1m) {
      this.colorRelleno = lerpColor(
        colorAzulClaro,
        colorVerdeOscuro,
        (altura - azulm) / (verde1m - azulm)
      );
    } else if (altura <= verde2m) {
      this.colorRelleno = lerpColor(
        colorVerdeOscuro,
        colorVerdeClaro,
        (altura - verde1m) / (verde2m - verde1m)
      );
    } else if (altura <= cafem) {
      this.colorRelleno = lerpColor(
        colorVerdeClaro,
        colorCafe,
        (altura - verde2m) / (cafem - verde2m)
      );
    } else {
      // blancom
      this.colorRelleno = lerpColor(
        colorCafe,
        colorBlanco,
        (altura - cafem) / (blancom - cafem)
      );
    }
  }
  
  dibujaAltura(buffer) {
    buffer.fill(this.colorRelleno);
    buffer.stroke(22, 22, 22, 22);
    buffer.strokeWeight(0.3);
    buffer.rect(this.x, this.y, this.tam, this.tam);
  }

  // Método para mostrar la casilla con un color basado en el tiempo caminado
  dibujaCaminado(buffer, maxCaminadoTemp) {
    // Define los colores
    let colorAzul = color(10, 10, 255, 180); 
    let colorGris = color(128, 128, 128, 17); 

    // Calcula 't' basado en 'caminado'
    let t = constrain(map(this.caminado, 0, maxCaminadoTemp / 4, 0, 1), 0, 1);

    // Interpola entre los colores
    let caminadocolor = lerpColor(colorGris, colorAzul, t);

    // Apply the color and draw the rectangle
    buffer.fill(caminadocolor);
    buffer.noStroke();
    buffer.rect(this.x, this.y, this.tam, this.tam);
}
  
  dibujaProbRecursos(buffer){
    let probabilidad = this.valores.probabilidadRecurso;
    let colorProbabilidad = lerpColor(color(0, 0, 0,200), color(0, 255, 0,120), probabilidad/200);
    buffer.fill(colorProbabilidad);
    buffer.stroke(22, 22, 22, 22);
    buffer.strokeWeight(0.3);
    buffer.rect(this.x, this.y, this.tam, this.tam );
  }

  // Método para mostrar la casilla
  dibuja(buffer) {
    //this.updateColor();

    let colorFinal = this.colorRelleno;

    if (ui.mostrarCaminado) {
      // Atenuar el color original
      let atenuado = lerpColor(this.colorRelleno, color(255), 0.2);
      // Color azul basado en "caminado"
      let azulIntensity = map(this.caminado, 0, maxCaminadoTemp / 4, 0, 255);
      let caminadocolor = color(0, 0, azulIntensity);
      // Combinar colores
      colorFinal = lerpColor(atenuado, caminadocolor, 0.8);
    }

    buffer.fill(colorFinal);
    buffer.stroke(22, 22, 22, 22);
    buffer.strokeWeight(0.3);
    buffer.rect(this.x, this.y, this.tam, this.tam);

    
  }
}
