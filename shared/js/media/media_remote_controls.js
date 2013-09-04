'use strict';

// Commands for AVRCP.
var AVRCP = {
  PLAY_PRESS: 'media-play-button-press',
  PLAY_RELEASE: 'media-play-button-release',
  PAUSE_PRESS: 'media-pause-button-press',
  PAUSE_RELEASE: 'media-pause-button-release',
  PLAY_PAUSE_PRESS: 'media-play-pause-button-press',
  PLAY_PAUSE_RELEASE: 'media-play-pause-button-release',
  STOP_PRESS: 'media-stop-button-press',
  STOP_RELEASE: 'media-stop-button-release',
  NEXT_PRESS: 'media-next-track-button-press',
  NEXT_RELEASE: 'media-next-track-button-release',
  PREVIOUS_PRESS: 'media-previous-track-button-press',
  PREVIOUS_RELEASE: 'media-previous-track-button-release',
  FAST_FORWARD_PRESS: 'media-fast-forward-button-press',
  FAST_FORWARD_RELEASE: 'media-fast-forward-button-release',
  REWIND_PRESS: 'media-rewind-button-press',
  REWIND_RELEASE: 'media-rewind-button-release'
};

// Commands for Inter-App Communication.
var IAC = {
  PLAY_PAUSE_PRESS: 'playpause',
  STOP_PRESS: 'stop',
  NEXT_PRESS: 'nexttrack',
  PREVIOUS_PRESS: 'prevtrack',
  FAST_FORWARD_PRESS: 'fastforwardstart',
  FAST_FORWARD_RELEASE: 'fastforwardend',
  REWIND_PRESS: 'rewindstart',
  REWIND_RELEASE: 'rewindend'
};

// Commands for remote CustomEvent that we actually dispatched.
var REMOTE_CONTORLS = {
  PLAY: 'media-play',
  PAUSE: 'media-pause',
  STOP: 'media-stop',
  NEXT: 'media-next',
  PREVIOUS: 'media-previous',
  SEEK_PRESS: 'media-seek-press',
  SEEK_RELEASE: 'media-seek-release'
};

function MediaRemoteControls() {
  this.bluetooth = navigator.mozBluetooth;
  this.defaultAdapter = null;
  this.updateMetadataHandler = null;
  this.updateStatusHandler = null;
}

MediaRemoteControls.prototype.setUpdateMetadataHandler = function(handler) {
  this.updateMetadataHandler = handler;
};

MediaRemoteControls.prototype.setUpdateStatusHandler = function(handler) {
  this.updateStatusHandler = handler;
};

MediaRemoteControls.prototype.start = function() {
  // AVRCP commands use system message.
  navigator.mozSetMessageHandler('media-button', this._commandHandler);

  // The bluetooth adapter will be needed to send metadata and play status
  // when those information are changed.
  if (this.bluetooth) {
    this.bluetooth.onadapteradded = initialDefaultAdapter.bind(this);
    this.bluetooth.ondisabled = resetDefaultAdapter.bind(this);
    // Get the default adapter at start because bluetooth might already enabled.
    initialDefaultAdapter.call(this);
  } else {
    console.warn('No mozBluetooth');
  }

  function initialDefaultAdapter() {
    var request = this.bluetooth.getDefaultAdapter();
    request.onsuccess = configureAdapter.bind(this);
    request.onerror = resetDefaultAdapter.bind(this);
  }

  function configureAdapter(event) {
    this.defaultAdapter = event.target.result;
    this.defaultAdapter.onrequestmediaplaystatus = this.updateStatusHandler;
    this.defaultAdapter.ona2dpstatuschanged = a2dpConnectionHandler.bind(this);
  }

  // A2DP is connected: update the status to the bluetooth device.
  // A2DP is disconnected: pause the player like the headphone is unplugged.
  function a2dpConnectionHandler(event) {
    var isConnected = event.status;
    if (isConnected && this.updateStatusHandler)
      this.updateStatusHandler();
    else
      this._commandHandler(AVRCP.PAUSE_PRESS);
  }

  function resetDefaultAdapter() {
    this.defaultAdapter = null;
    // Do we need to do anything else?
  }

  // IAC commands would likely also use the system messages, please see:
  // https://wiki.mozilla.org/WebAPI/Inter_App_Communication_Alt_proposal
  // so we will listen to the IAC system message after it's landed.
};

MediaRemoteControls.prototype._commandHandler = function(message) {
  var type = 'remote';
  var option = {};

  switch (message) {
    case AVRCP.PLAY_PRESS:
    case AVRCP.PLAY_PAUSE_PRESS:
    case IAC.PLAY_PAUSE_PRESS:
      option.detail = { command: REMOTE_CONTORLS.PLAY };
      break;
    case AVRCP.PAUSE_PRESS:
      option.detail = { command: REMOTE_CONTORLS.PAUSE };
      break;
    case AVRCP.STOP_PRESS:
    case IAC.STOP_PRESS:
      option.detail = { command: REMOTE_CONTORLS.STOP };
      break;
    case AVRCP.NEXT_PRESS:
    case IAC.NEXT_PRESS:
      option.detail = { command: REMOTE_CONTORLS.NEXT };
      break;
    case AVRCP.PREVIOUS_PRESS:
    case IAC.PREVIOUS_PRESS:
      option.detail = { command: REMOTE_CONTORLS.PREVIOUS };
      break;
    case AVRCP.FAST_FORWARD_PRESS:
    case IAC.FAST_FORWARD_PRESS:
      option.detail = { command: REMOTE_CONTORLS.SEEK_PRESS, direction: true };
      break;
    case AVRCP.REWIND_PRESS:
    case IAC.REWIND_PRESS:
      option.detail = { command: REMOTE_CONTORLS.SEEK_PRESS, direction: false };
      break;
    case AVRCP.FAST_FORWARD_RELEASE:
    case IAC.FAST_FORWARD_RELEASE:
    case AVRCP.REWIND_RELEASE:
    case IAC.REWIND_RELEASE:
      option.detail = { command: REMOTE_CONTORLS.SEEK_RELEASE };
      break;
    default:
      return;
  }

  var event = new CustomEvent(type, option);
  window.dispatchEvent(event);
};

MediaRemoteControls.prototype.notifyMetadataChanged = function(metadata) {
  // Send the new metadata via bluetooth.
  if (this.defaultAdapter) {
    var request = this.defaultAdapter.sendMediaMetaData(metadata);

    request.onsuccess = function() {
      console.log('sendMediaMetaData success' + JSON.stringify(metadata));
    };
    request.onerror = function() {
      console.log('sendMediaMetaData error');
    };
  }
  // If IAC exists, we will also notify the metadata to the requester.
};

MediaRemoteControls.prototype.notifyStatusChanged = function(status) {
  // Send the new status via bluetooth.
  if (this.defaultAdapter) {
    var request = this.defaultAdapter.sendMediaPlayStatus(status);

    request.onsuccess = function() {
      console.log('sendMediaPlayStatus success' + JSON.stringify(status));
    };
    request.onerror = function() {
      console.log('sendMediaPlayStatus error');
    };
  }
  // If IAC exists, we will also notify the status to the requester.
};
