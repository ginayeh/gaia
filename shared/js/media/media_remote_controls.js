'use strict';

// Commands for AVRCP
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

var REMOTE_CONTORLS = {
  PLAY: 'remote-play',
  PAUSE: 'remote-pause',
  STOP: 'remote-stop',
  NEXT: 'remote-next',
  PREVIOUS: 'remote-previous',
  SEEK_PRESS: 'remote-seek-press',
  SEEK_RELEASE: 'remote-seek-release'
};

function MediaRemoteControls() {}

MediaRemoteControls.prototype.start = function start() {
  navigator.mozSetMessageHandler('media-button', this._commandHandler);
};

MediaRemoteControls.prototype._commandHandler = function(message) {
  var type = 'remote';
  var option = {};

  switch (message) {
    case AVRCP.PLAY_PRESS:
    case AVRCP.PLAY_PAUSE_PRESS:
      option.detail = { command: REMOTE_CONTORLS.PLAY };
      break;
    case AVRCP.PAUSE_PRESS:
      option.detail = { command: REMOTE_CONTORLS.PAUSE };
      break;
    case AVRCP.STOP_PRESS:
      option.detail = { command: REMOTE_CONTORLS.STOP };
      break;
    case AVRCP.NEXT_PRESS:
      option.detail = { command: REMOTE_CONTORLS.NEXT };
      break;
    case AVRCP.PREVIOUS_PRESS:
      option.detail = { command: REMOTE_CONTORLS.PREVIOUS };
      break;
    case AVRCP.FAST_FORWARD_PRESS:
      option.detail = { command: REMOTE_CONTORLS.SEEK_PRESS, direction: true };
      break;
    case AVRCP.REWIND_PRESS:
      option.detail = { command: REMOTE_CONTORLS.SEEK_PRESS, direction: false };
      break;
    case AVRCP.FAST_FORWARD_RELEASE:
    case AVRCP.REWIND_RELEASE:
      option.detail = { command: REMOTE_CONTORLS.SEEK_RELEASE };
      break;
  }

  var event = new CustomEvent(type, option);
  window.dispatchEvent(event);
};
