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
  PLAY: 'remote-media-play',
  PAUSE: 'remote-media-pause',
  STOP: 'remote-media-stop',
  NEXT: 'remote-media-next',
  PREVIOUS: 'remote-media-previous',
  SEEK_PRESS: 'remote-media-seek-press',
  SEEK_RELEASE: 'remote-media-seek-release'
};

function MediaRemoteControls() {
  this.bluetooth = navigator.mozBluetooth;
  this.defaultAdapter = null;
}

MediaRemoteControls.prototype.start = function() {
  // AVRCP commands use system message.
  navigator.mozSetMessageHandler('media-button', this._commandHandler);

  // The bluetooth adapter will be needed to send metadata and play status
  // when these information are changed.
  if (this.bluetooth) {
    var request = this.defaultAdapter = this.bluetooth.getDefaultAdapter();
    var self = this;
    request.onsuccess = function() {
      self.defaultAdapter = request.result;
      console.log('Got default adapter');
    };
    request.onerror = function() {
      console.log('Cannot get default adapter');
    };
  } else {
    console.log('No mozBluetooth');
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
};
