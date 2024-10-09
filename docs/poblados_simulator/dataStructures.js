class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(valor, prioridad) {
    this.heap.push({ valor: valor, prioridad: prioridad });
    this.bubbleUp();
  }

  pop() {
    if (this.heap.length === 1) {
      return this.heap.pop().valor;
    }
    const min = this.heap[0].valor;
    this.heap[0] = this.heap.pop();
    this.bubbleDown();
    return min;
  }

  bubbleUp() {
    let indice = this.heap.length - 1;
    while (indice > 0) {
      let elemento = this.heap[indice];
      let indicePadre = Math.floor((indice - 1) / 2);
      let padre = this.heap[indicePadre];
      if (elemento.prioridad >= padre.prioridad) break;
      this.heap[indice] = padre;
      this.heap[indicePadre] = elemento;
      indice = indicePadre;
    }
  }

  bubbleDown() {
    let indice = 0;
    let tam = this.heap.length;
    let elemento = this.heap[0];
    while (true) {
      let hijoIzqIndex = 2 * indice + 1;
      let hijoDerIndex = 2 * indice + 2;
      let hijoIzq, hijoDer;
      let intercambiar = null;

      if (hijoIzqIndex < tam) {
        hijoIzq = this.heap[hijoIzqIndex];
        if (hijoIzq.prioridad < elemento.prioridad) {
          intercambiar = hijoIzqIndex;
        }
      }

      if (hijoDerIndex < tam) {
        hijoDer = this.heap[hijoDerIndex];
        if (
          (intercambiar === null && hijoDer.prioridad < elemento.prioridad) ||
          (intercambiar !== null && hijoDer.prioridad < hijoIzq.prioridad)
        ) {
          intercambiar = hijoDerIndex;
        }
      }

      if (intercambiar === null) break;
      this.heap[indice] = this.heap[intercambiar];
      this.heap[intercambiar] = elemento;
      indice = intercambiar;
    }
  }

  size() {
    return this.heap.length;
  }
}


