var gn, sessionData = [], isSessionActive = false;

function initSensors() {
  var args = {
    frequency: 5, // 50 is default
    logger: gnLogger
  };
  gn = new GyroNorm();
  gn.init(args).then(function () {
    checkBrowserSupport(gn.isAvailable());
    gn.start(gnCallBack);
  }).catch(function (e) {
    console.log(e);
    log({ message: 'Unable to read sensors, check console', type: 'error' });
  });
}

function checkBrowserSupport(gnIsAvailable) {
  if (!gnIsAvailable.deviceOrientationAvailable) {
    log({ message: 'Device orientation is not available.', type: 'error' });
  }
  if (!gnIsAvailable.accelerationAvailable) {
    log({ message: 'Device acceleration is not available.', type: 'error' });
  }
  if (!gnIsAvailable.accelerationIncludingGravityAvailable) {
    log({ message: 'Device acceleration incl. gravity is not available.', type: 'error' });
  }
  if (!gnIsAvailable.rotationRateAvailable) {
    log({ message: 'Device rotation rate is not available.', type: 'error' });
  }
}

function updateUI(data, timestamp) {
  $('#compassHeading').val(data.compassHeading);
  $('#do_alpha').val(data.do.alpha);
  $('#do_beta').val(data.do.beta);
  $('#do_gamma').val(data.do.gamma);
  $('#dm_x').val(data.dm.x);
  $('#dm_y').val(data.dm.y);
  $('#dm_z').val(data.dm.z);
  $('#dm_gx').val(data.dm.gx);
  $('#dm_gy').val(data.dm.gy);
  $('#dm_gz').val(data.dm.gz);
  $('#dm_alpha').val(data.dm.alpha);
  $('#dm_beta').val(data.dm.beta);
  $('#dm_gamma').val(data.dm.gamma);
}

function recordData(data, timestamp) {
  sessionData.push([
    timestamp,
    data.compassHeading,
    data.do.alpha,
    data.do.beta,
    data.do.gamma,
    data.dm.x,
    data.dm.y,
    data.dm.z,
    data.dm.gx,
    data.dm.gy,
    data.dm.gz,
    data.dm.alpha,
    data.dm.beta,
    data.dm.gamma
  ]);
}

function downloadSensorData(startTimestamp, stopTimestamp) {
  var lines = ['data:text/csv;charset=utf-8,timestamp,"Compass heading","Orientation alpha","Orientation beta","Orientation gama","Acceleration x","Acceleration y","Acceleration z","Acceleration + Gravity x","Acceleration + Gravity y","Acceleration + Gravity z","Rotation rate alpha","Rotation rate beta","Rotation rate gamma"'];
  sessionData.forEach(function (record, index) {
    lines.push(record.join(','));
  });
  var csvContent = lines.join('\n');

  // Download
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', startTimestamp + '_' + stopTimestamp + '.csv');
  link.click();
}

function gnCallBack(data) {
  if (isSessionActive) {
    let timestamp = (new Date()).getTime();
    data.compassHeading = compassHeading(data.do.alpha, data.do.beta, data.do.gamma);
    updateUI(data, timestamp);
    recordData(data, timestamp);
  }
}

function startSensorRecording() {
  sessionData = [];
  isSessionActive = true;
}

function stopSensorRecording() {
  isSessionActive = false;
}

// Utilities

function gnLogger(data) {
  console.log('gyronorm:', data);
}

var degtorad = Math.PI / 180; // Degree-to-Radian conversion

function compassHeading(alpha, beta, gamma) {

  var _x = beta ? beta * degtorad : 0; // beta value
  var _y = gamma ? gamma * degtorad : 0; // gamma value
  var _z = alpha ? alpha * degtorad : 0; // alpha value

  var cX = Math.cos(_x);
  var cY = Math.cos(_y);
  var cZ = Math.cos(_z);
  var sX = Math.sin(_x);
  var sY = Math.sin(_y);
  var sZ = Math.sin(_z);

  // Calculate Vx and Vy components
  var Vx = - cZ * sY - sZ * sX * cY;
  var Vy = - sZ * sY + cZ * sX * cY;

  // Calculate compass heading
  var compassHeading = Math.atan(Vx / Vy);

  // Convert compass heading to use whole unit circle
  if (Vy < 0) {
    compassHeading += Math.PI;
  } else if (Vx < 0) {
    compassHeading += 2 * Math.PI;
  }

  return compassHeading * (180 / Math.PI); // Compass Heading (in degrees)

}
