let nodes = [];
let links = [];
let selectedNode = null;
let dragging = false;
let availableVariables = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(97 + i)
);
let variableIndex = 0;
let t=0;

let graphData = [];
let graphWidth = 200;
let graphHeight = 100;

let minValue = 0;
let maxValue = 100;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  t=frameCount
  background(220);

  // Actualizar y dibujar enlaces
  for (let link of links) {
    link.update();
    link.display();
  }

  // Actualizar y dibujar nodos
  for (let node of nodes) {
    node.update();
    node.display();
  }

  // Mostrar gráfica si hay un nodo seleccionado
  if (selectedNode) {
    displayGraph();
  }
}

function mousePressed() {
  let clickedNode = null;
  for (let node of nodes) {
    if (node.isMouseOver()) {
      clickedNode = node;
      break;
    }
  }

  if (clickedNode) {
    // Deseleccionar el nodo previamente seleccionado
    if (selectedNode && selectedNode !== clickedNode) {
      selectedNode.selected = false;
    }
    selectedNode = clickedNode;
    selectedNode.selected = true;
    dragging = true;
  } else {
    // Deseleccionar si se hace clic fuera de un nodo
    if (selectedNode) selectedNode.selected = false;
    selectedNode = null;
    dragging = false;
  }
}

function mouseReleased() {
  dragging = false;
}

function keyPressed() {
  if (key === 'n' && availableVariables.length > 0) {
    // Crear un nuevo nodo en la posición del mouse
    let variable = availableVariables.shift();
    let newNode = new Node(mouseX, mouseY, variable);
    nodes.push(newNode);
  }

  if (key === 'x' && selectedNode) {
    // Eliminar el nodo seleccionado
    availableVariables.unshift(selectedNode.variable);
    nodes = nodes.filter((node) => node !== selectedNode);
    // Eliminar cualquier enlace asociado con este nodo
    links = links.filter(
      (link) => link.startNode !== selectedNode && link.endNode !== selectedNode
    );
    selectedNode = null;
  }

  if (key === 'l' && selectedNode) {
    // Iniciar la creación de un enlace desde el nodo seleccionado
    let endNodeVar = prompt('Seleccione el nodo de destino (variable):');
    let targetNode = nodes.find((node) => node.variable === endNodeVar);
    if (targetNode) {
      let func = prompt(
        `Defina la función usando '${selectedNode.variable}' (por ejemplo: ${selectedNode.variable} * 2):`
      );
      let newLink = new Link(selectedNode, targetNode, func);
      links.push(newLink);
    } else {
      alert('Nodo de destino no encontrado.');
    }
  }
}

// Clase Node
class Node {
  constructor(x, y, variable) {
    this.x = x;
    this.y = y;
    this.size = 50;
    this.variable = variable;
    this.value = random(1, 10);
    this.selected = false;
    this.history = [];
  }

  update() {
    if (this.selected && dragging) {
      this.x = mouseX;
      this.y = mouseY;
    }
    // Restringir el valor dentro de minValue y maxValue
    this.value = constrain(this.value, minValue, maxValue);

    // Mantener historial para la gráfica
    if (frameCount % 10 === 0) {
      this.history.push({ time: frameCount, value: this.value });
      if (this.history.length > graphWidth) {
        this.history.shift();
      }
    }
  }

  display() {
    fill(this.selected ? 'lightblue' : 'white');
    stroke(0);
    ellipse(this.x, this.y, this.size);
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    text(`${this.variable}\n${this.value.toFixed(2)}`, this.x, this.y);
  }

  isMouseOver() {
    return dist(mouseX, mouseY, this.x, this.y) < this.size / 2;
  }
}

// Clase Link
class Link {
  constructor(startNode, endNode, func) {
    this.startNode = startNode;
    this.endNode = endNode;
    this.funcStr = func;
  }

  update() {
    try {
      // Crear una función a partir del string
      let func = new Function(
        this.startNode.variable,
        `return ${this.funcStr};`
      );
      // Aplicar la función para modificar el valor del nodo de destino
      this.endNode.value += func(this.startNode.value);
      // Restringir el valor del nodo de destino dentro de minValue y maxValue
      this.endNode.value = constrain(this.endNode.value, minValue, maxValue);
    } catch (e) {
      console.error('Error en la función:', e);
    }
  }

  display() {
    stroke('red');
    line(
      this.startNode.x,
      this.startNode.y,
      this.endNode.x,
      this.endNode.y
    );
    // Mostrar la función cerca del enlace
    let midX = (this.startNode.x + this.endNode.x) / 2;
    let midY = (this.startNode.y + this.endNode.y) / 2;
    noStroke();
    fill(0);
    text(this.funcStr, midX, midY);
  }
}

// Mostrar la gráfica en la esquina superior derecha
function displayGraph() {
  push();
  translate(width - graphWidth - 10, 10);
  fill(255);
  stroke(0);
  rect(0, 0, graphWidth, graphHeight);

  // Dibujar ejes
  stroke(0);
  line(0, graphHeight, graphWidth, graphHeight);
  line(0, 0, 0, graphHeight);

  // Graficar el historial
  beginShape();
  noFill();
  stroke('blue');
  for (let i = 0; i < selectedNode.history.length; i++) {
    let x = map(i, 0, selectedNode.history.length - 1, 0, graphWidth);
    let y = map(
      selectedNode.history[i].value,
      minValue,
      maxValue,
      graphHeight,
      0
    );
    vertex(x, y);
  }
  endShape();

  // Etiquetas
  fill(0);
  noStroke();
  textAlign(LEFT, TOP);
  text(
    `Valor de ${selectedNode.variable} en el tiempo`,
    5,
    5
  );
  pop();
}
