var recorder, audioChunks = [];
var analyser, freqs = [], times = [], freqChunks = [], timesChunks = [];
var HEIGHT = 200, WIDTH = 640;

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    // Record
    recorder = new MediaRecorder(stream);
    // Visualize
    var audioContent = new AudioContext();
    var audioStream = audioContent.createMediaStreamSource(stream);
    analyser = audioContent.createAnalyser();
    audioStream.connect(analyser);
    analyser.fftSize = 1024;
    freqs = new Uint8Array(analyser.frequencyBinCount);
    times = new Uint8Array(analyser.frequencyBinCount);
    drawViz();
  })
  .catch(e => console.error('getUserMedia error', e));

function drawViz() {
  WIDTH = $('.row:first').width() - 40;
  //var width = Math.floor(1 / freqs.length, 10);

  analyser.getByteFrequencyData(freqs);
  analyser.getByteTimeDomainData(times);
  freqChunks.push(new Uint8Array(freqs));
  timesChunks.push(new Uint8Array(times));

  var canvas = document.querySelector('canvas');
  var drawContext = canvas.getContext('2d');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  // Draw the frequency domain chart
  for (var i = 0; i < analyser.frequencyBinCount; i++) {
    var value = freqs[i];
    var percent = value / 256; // values are 0 - 255
    var height = HEIGHT * percent;
    var offset = HEIGHT - height - 1;
    var barWidth = WIDTH / analyser.frequencyBinCount;
    var hue = i / analyser.frequencyBinCount * 360;
    //drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
    drawContext.fillStyle = '#cce5ff';
    drawContext.fillRect(i * barWidth, offset, barWidth, height);
  }

  // Draw the time domain chart
  for (var i = 0; i < analyser.frequencyBinCount; i++) {
    var value = times[i];
    var percent = value / 256;
    var height = HEIGHT * percent;
    var offset = HEIGHT - height - 1;
    var barWidth = WIDTH / analyser.frequencyBinCount;
    drawContext.fillStyle = 'black';
    drawContext.fillRect(i * barWidth, offset, 1, 2);
  }

  setTimeout(drawViz, 5);

}

function downloadRawData(startTimestamp, stopTimestamp) {
  // Frequency
  var lines = ['data:text/csv;charset=utf-8'];
  freqChunks.forEach(function (record, index) {
    lines.push(record.join(','));
  });
  var csvContent = lines.join('\n');

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'freq.csv');
  link.click();

  // Time
  var lines = ['data:text/csv;charset=utf-8'];
  timesChunks.forEach(function (record, index) {
    lines.push(record.join(','));
  });
  var csvContent = lines.join('\n');

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'time.csv');
  link.click();
}

function startRecording() {
  audioChunks = [];
  freqChunks = [];
  timesChunks = [];
  recorder.start();
}

function stopRecording(startTimestamp, stopTimestamp) {
  recorder.ondataavailable = e => {
    audioChunks.push(e.data);
    if (recorder.state == "inactive") {
      let blob = new Blob(audioChunks, { type: 'audio/x-wav' });
      let src = URL.createObjectURL(blob);
      $('#audioPlayer').attr('src', src);
      $('#audioPlayer').attr('controls', true);
      $('#audioPlayer').attr('autoplay', false);

      var audioLink = document.createElement('a');
      audioLink.setAttribute('href', src);
      audioLink.setAttribute('download', startTimestamp + '_' + stopTimestamp + '.wav');
      audioLink.click();

      /*$('#downloadAudio').attr('href', src);
      $('#downloadAudio').attr('download', startTimestamp + '_' + stopTimestamp + '.ogg');*/
    }
  };
  recorder.stop();
  downloadRawData();
}
