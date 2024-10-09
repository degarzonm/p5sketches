class Quadtree {
    constructor(x1, y1, x2, y2, cap, depth = 1, parent = null) {
      this.limites = { x1, y1, x2, y2 };
  
      this.objetos = [];
  
      this.dividido = false;
      this.norDerecha = null;
      this.norIzquierda = null;
      this.surIzquierda = null;
      this.surDerecha = null;
  
      this.capacidad = cap;
      this.profundidad = depth;
      this.parent = parent;
  
      this.muestraCasillaVacia = true;
      this.muestraBordes = true;
    }
  
    inserta(obj) {
      if (!this.dentroDeLimites(obj)) return false;
  
      if (this.dividido) {
        return (
          this.norDerecha.inserta(obj) ||
          this.norIzquierda.inserta(obj) ||
          this.surDerecha.inserta(obj) ||
          this.surIzquierda.inserta(obj)
        );
      }
  
      if (this.objetos.length < this.capacidad) {
        this.objetos.push(obj);
        obj.container = this;
        return true;
      } else {
        this.subdividir();
        this.inserta(obj);
      }
    }
  
    subdividir() {
      let midX = (this.limites.x1 + this.limites.x2) / 2;
      let midY = (this.limites.y1 + this.limites.y2) / 2;
      this.norDerecha = new Quadtree(
        midX,
        this.limites.y1,
        this.limites.x2,
        midY,
        this.capacidad + 1,
        this.profundidad + 1,
        this
      );
      this.norIzquierda = new Quadtree(
        this.limites.x1,
        this.limites.y1,
        midX,
        midY,
        this.capacidad + 1,
        this.profundidad + 1,
        this
      );
      this.surIzquierda = new Quadtree(
        this.limites.x1,
        midY,
        midX,
        this.limites.y2,
        this.capacidad + 1,
        this.profundidad + 1,
        this
      );
      this.surDerecha = new Quadtree(
        midX,
        midY,
        this.limites.x2,
        this.limites.y2,
        this.capacidad + 1,
        this.profundidad + 1,
        this
      );
      this.dividido = true;
      //mueve los objetos a las subdivisiones y los elimina del actual nodo
      for (let obj of this.objetos) {
        if (this.norDerecha.inserta(obj)) continue;
        if (this.norIzquierda.inserta(obj)) continue;
        if (this.surDerecha.inserta(obj)) continue;
        if (this.surIzquierda.inserta(obj)) continue;
      }
      this.objetos = [];
    }
  
    dentroDeLimites(obj) {
      return (
        obj.position.x >= this.limites.x1 &&
        obj.position.x < this.limites.x2 &&
        obj.position.y >= this.limites.y1 &&
        obj.position.y < this.limites.y2
      );
    }
  
    query(range, found = []) {
      if (!this.intersects(range)) {
        return found;
      }
  
      for (let object of this.objetos) {
        if (this.isInRange(object, range)) {
          found.push(object);
        }
      }
  
      if (this.dividido) {
        this.norDerecha.query(range, found);
        this.norIzquierda.query(range, found);
        this.surDerecha.query(range, found);
        this.surIzquierda.query(range, found);
      }
  
      return found;
    }
  
    intersects(range) {
      return !(
        range.x1 > this.limites.x2 ||
        range.x2 < this.limites.x1 ||
        range.y1 > this.limites.y2 ||
        range.y2 < this.limites.y1
      );
    }
  
    isInRange(object, range) {
      return (
        object.position.x >= range.x1 &&
        object.position.x < range.x2 &&
        object.position.y >= range.y1 &&
        object.position.y < range.y2
      );
    }
  
    forEach(callback) {
      if (this.dividido) {
        this.norDerecha.forEach(callback);
        this.norIzquierda.forEach(callback);
        this.surDerecha.forEach(callback);
        this.surIzquierda.forEach(callback);
      }
      for (let obj of this.objetos) {
        callback(obj);
      }
    }
  
    remove(obj) {
      const index = this.objetos.indexOf(obj);
      if (index > -1) {
        this.objetos.splice(index, 1);
        obj.quadtree = null;
        return true;
      }
  
      if (this.dividido) {
        return (
          this.norDerecha.remove(obj) ||
          this.norIzquierda.remove(obj) ||
          this.surDerecha.remove(obj) ||
          this.surIzquierda.remove(obj)
        );
      }
  
      return false;
    }
  
    update() {
      if (this.dividido) {
        this.norDerecha.update();
        this.norIzquierda.update();
        this.surDerecha.update();
        this.surIzquierda.update();
      }
      for (let obj of this.objetos) {
        if (!this.dentroDeLimites(obj)) {
          this.remove(obj);
          let root = this;
          while (root.parent) {
            root = root.parent;
          }
          root.inserta(obj);
        }
      }
      this.eliminarSubdivisiones();
    }
  
    eliminarSubdivisiones() {
      if (this.dividido) {
        this.norDerecha.eliminarSubdivisiones();
        this.norIzquierda.eliminarSubdivisiones();
        this.surDerecha.eliminarSubdivisiones();
        this.surIzquierda.eliminarSubdivisiones();
  
        if (
          !this.norDerecha.objetos.length &&
          !this.norIzquierda.objetos.length &&
          !this.surDerecha.objetos.length &&
          !this.surIzquierda.objetos.length &&
          !this.norDerecha.dividido &&
          !this.norIzquierda.dividido &&
          !this.surDerecha.dividido &&
          !this.surIzquierda.dividido
        ) {
          this.norDerecha = null;
          this.norIzquierda = null;
          this.surDerecha = null;
          this.surIzquierda = null;
          this.dividido = false;
        }
      }
    }
    
    length(){
      if(this.dividido){
      return norDerecha.length()+norIzquierda.length+surIzquierda.length()+surDerecha.length()
      
      }
      
      return this.objetos.length
    }
  
    show() {
      if (this.dividido) {
        this.norDerecha.show();
        this.norIzquierda.show();
        this.surDerecha.show();
        this.surIzquierda.show();
      }
  
      if (
        this.objetos.length == 0 &&
        !this.dividido &&
        this.muestraCasillaVacia
      ) {
        fill( 20+ 50 * (this.profundidad-1), 
             20 + 50 * this.profundidad,
             295-30*this.profundidad,
             180-3*this.profundidad
            );
      } else {
        noFill();
      }
      if (this.muestraBordes) {
        stroke(200);
        strokeWeight(1  / this.profundidad);
        rect(
          this.limites.x1,
          this.limites.y1,
          this.limites.x2 - this.limites.x1,
          this.limites.y2 - this.limites.y1,
          30 / this.profundidad
        );
      }
    }
  }
  