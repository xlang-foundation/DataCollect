'use strict';

const videoElement = document.querySelector('video');
const videoSelect = document.querySelector('select#videoSource');
const shotElement = document.querySelector('button#shot');
const img = document.querySelector('img#preview-img');
const selectors = [
  videoSelect
];
let hasCamera = false;
let openCamera = undefined;
let hasPermission = false;

function getDevices() {
  navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
}

function gotDevices(deviceInfos) {
  hasCamera = false;
  hasPermission = false;
  // Handles being called several times to update labels. Preserve values.
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    if (deviceInfo.deviceId == '') {
      continue;
    }
    // If we get at least one deviceId, that means user has granted user
    // media permissions.
    hasPermission = true;
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'videoinput') {
      hasCamera = true;
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo.label);
    }
  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
  start();
}

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  videoElement.srcObject = stream;
  const videoTrack = stream.getVideoTracks()[0]
  if (videoTrack) {
    const settings = videoTrack.getSettings();
    const capabilities = videoTrack.getCapabilities();
    const input = document.querySelector('input[type="range"]');
    openCamera = settings.deviceId;
    // 妫€鏌ユ槸鍚︽敮鎸佺缉鏀俱€�
    if (!('zoom' in settings)) {
      return Promise.reject('Zoom is not supported by ' + videoTrack.label);
    }
    // Map zoom to a slider element.
    input.min = capabilities.zoom.min;
    input.max = capabilities.zoom.max;
    input.step = capabilities.zoom.step;
    input.value = settings.zoom;
    input.oninput = function(event) {
      console.log(event.target.value);
      videoTrack.applyConstraints({advanced: [ {zoom: event.target.value} ]});
    }
    document.querySelector('.zoom').classList.remove('hidden');
  }
  return getDevices();
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

function start() {
  const videoSource = videoSelect.value || undefined;
  // Don't open the same devices again.
  if (hasPermission && openCamera == videoSource) {
    return;
  }
  // Close existng streams.
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
    openCamera = undefined;
  }
  const constraints = {
    video: true
  };

  if (hasCamera) {
    constraints['video'] = {deviceId: videoSource ? {exact: videoSource} : undefined};
  }
  console.log('start', constraints);
  if (!hasPermission || hasCamera) {
    navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
  }
}

videoSelect.onchange = start;
navigator.mediaDevices.ondevicechange = getDevices;

getDevices();

shotElement.onclick = function() {
  const videoTrack = window.stream?.getVideoTracks()[0]
  if (videoTrack) {
    let capture = new ImageCapture(videoTrack)
    capture
    .takePhoto()
    .then((blob) => {
      console.log("Took photo:", blob);
      img.classList.remove("hidden");
      img.src = URL.createObjectURL(blob);
    })
    .catch((error) => {
      console.error("takePhoto() error: ", error);
    });
  }
}

