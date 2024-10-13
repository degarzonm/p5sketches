let song;
let fft;
let playButton, volumeSlider;
let filterTypeSelect, filterFreqSlider, filterResSlider;
let filter;
let spectrum=[];
let spectrum_history=[];
let spectrum_average=[];
let maxSpectrumHistory=5;


function preload() {
  song = loadSound("../common/music/canc.ogg");
}

function setup() {
  createCanvas(1400, 900);
  fft = new p5.FFT(0.9, 64);

  // Existing UI elements
  playButton = createButton("▶ ⏸");
  playButton.position(10, 10);
  playButton.mousePressed(togglePlay);

  volumeSlider = createSlider(0, 1, 0.5, 0.01);
  volumeSlider.position(70, 10);
  volumeSlider.style("width", "100px");
  volumeSlider.input(changeVolume);

  // New UI elements for filter control
  filterTypeSelect = createSelect();
  filterTypeSelect.position(10, 40);
  filterTypeSelect.option('lowpass');
  filterTypeSelect.option('highpass');
  filterTypeSelect.option('bandpass');
  filterTypeSelect.changed(updateFilter);

  filterFreqSlider = createSlider(20, 10000, 10000, 1);
  filterFreqSlider.position(100, 40);
  filterFreqSlider.style("width", "200px");
  filterFreqSlider.input(updateFilter);

  filterResSlider = createSlider(0, 5, 1, 0.1);
  filterResSlider.position(310, 40);
  filterResSlider.style("width", "100px");
  filterResSlider.input(updateFilter);

  // Create and connect the filter
  filter = new p5.Filter();
  song.disconnect();
  song.connect(filter);
  updateFilter();
}

function draw() {
  background(30,30,30,10);

  spectrum = fft.analyze();
  //añade el espectro actual al historial, se guardaran los ultimos 100 espectros y se calcula el promedio para cada frecuencia
  // para guardarlo en spectrum_average, usa un for each
  
  spectrum_history.push(spectrum);
  if(spectrum_history.length>maxSpectrumHistory){
    spectrum_history.shift();
  }
  spectrum_average=Array.from(spectrum);
  spectrum_average.fill(0);
  spectrum_history.forEach(s=>{
    s.forEach((v,i)=>{
      spectrum_average[i]+=v;
    });
  });
  spectrum_average.forEach((v,i)=>{
    spectrum_average[i]=v/spectrum_history.length;
  }
  );
 
  drawActualSpectrum(spectrum)
  drawAccumulatedSpectrum(spectrum,spectrum_average);
  // Display current filter settings
  fill(255);
  textSize(14);
  text(`Filter Type: ${filterTypeSelect.value()}`, 10, 80);
  text(`Frequency: ${filterFreqSlider.value()} Hz`, 10, 100);
  text(`Resonance: ${filterResSlider.value()}`, 10, 120);
}

function togglePlay() {
  if (song.isPlaying()) {
    song.pause();
  } else {
    song.play();
  }
}

function drawActualSpectrum(spectrum){
  strokeWeight(1);
  stroke (255);
  textSize(11);
  let barWidth = width / spectrum.length;
  for (let i = 0; i < spectrum.length; i++) {
    //barras
    fill(100, 200, 250);
    let barHeight = map(spectrum[i], 0, 255, 0, height/3);
    rect(i * barWidth, height - barHeight, barWidth - 4, barHeight);
    
    //circulos
    fill(50, 200, 250);
    let radio=map(spectrum[i], 0, 255, 0, barWidth*1.5);
    ellipse(i * barWidth+barWidth/2, height/2+(i%2)*10, radio, radio);
    

    //label
    fill(122);
    text(barHeight.toFixed(0), i * barWidth-1, height-30-(i%2)*10);
  }
   
}

function drawAccumulatedSpectrum(spectrum, spectrum_average){
  
  textSize(11);
  noStroke();
  let barWidth = width / spectrum_average.length;
  let spectrum_diff=Array.from(spectrum_average);

  for (let i = 0; i < spectrum_average.length; i++) {
    //barras con el promedio del espectro 
    fill(200, 100, 250);
    let barHeight = map(spectrum_average[i], 0, 255, 0, height/3);
    rect(i * barWidth,0, barWidth - 2, barHeight);

    //pequeño reloj girando a la velocidad dada por el promedio del espectro
    fill(spectrum_average[i], spectrum_average[i], 150);
    let vel_angular = map(spectrum_average[i], 0, 300, 0, 1);

    let Θ = vel_angular*frameCount/(10)//+i
 
    let radio=barWidth/2 ;
    let x=i*barWidth+barWidth/3+radio*cos(Θ);
    let y=320+radio*sin(Θ);
    ellipse(x, y, 10, 10);

    //añade barras con la diferencia entre el espectro actual y el promedio
    fill(200, 100, 150);
    
    spectrum_diff[i]=abs(spectrum[i]-spectrum_average[i]);
    let barHeight_diff = map(spectrum_diff[i], 0, 255, 0, 80);
    rect(i * barWidth,400-barHeight_diff, barWidth - 2, 2*barHeight_diff);


    //añade un pequeño label en la base del rectangulo con el valor de la altura de cada barra
    
    fill(122);
    text(barHeight.toFixed(0), i * barWidth, barHeight+10);

  }
}


function changeVolume() {
  song.setVolume(volumeSlider.value());
}

function updateFilter() {
  let filterType = filterTypeSelect.value();
  let filterFreq = filterFreqSlider.value();
  let filterRes = filterResSlider.value();

  filter.setType(filterType);
  filter.freq(filterFreq);
  filter.res(filterRes);
}