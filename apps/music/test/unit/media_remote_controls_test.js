'use strict';

require('/shared/js/media/media_remote_controls.js');

suite('Media Remote Controls', function() {
  var mrc, receivedEvent;

  function remoteEventHandler(event) {
    receivedEvent = event;
  }

  function resetEvent() {
    receivedEvent = null;
  }

  setup(function() {
    mrc = new MediaRemoteControls();
    window.addEventListener('remote', remoteEventHandler);
  });
  teardown(function() {
    window.removeEventListener('remote', remoteEventHandler);
  });

  suite('AVRCP commands', function() {
    test('AVRCP.PLAY_PRESS', function() {
      mrc._commandHandler(AVRCP.PLAY_PRESS);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.PLAY);
      resetEvent();
    });
    test('AVRCP.PAUSE_PRESS', function() {
      mrc._commandHandler(AVRCP.PAUSE_PRESS);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.PAUSE);
      resetEvent();
    });
    test('AVRCP.STOP_PRESS', function() {
      mrc._commandHandler(AVRCP.STOP_PRESS);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.STOP);
      resetEvent();
    });
    test('AVRCP.NEXT_PRESS', function() {
      mrc._commandHandler(AVRCP.NEXT_PRESS);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.NEXT);
      resetEvent();
    });
    test('AVRCP.PREVIOUS_PRESS', function() {
      mrc._commandHandler(AVRCP.PREVIOUS_PRESS);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.PREVIOUS);
      resetEvent();
    });
    test('AVRCP.FAST_FORWARD_PRESS', function() {
      mrc._commandHandler(AVRCP.FAST_FORWARD_PRESS);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.SEEK_PRESS);
      assert.equal(receivedEvent.detail.direction, true);
      resetEvent();
    });
    test('AVRCP.REWIND_PRESS', function() {
      mrc._commandHandler(AVRCP.REWIND_PRESS);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.SEEK_PRESS);
      assert.equal(receivedEvent.detail.direction, false);
      resetEvent();
    });
    test('AVRCP.FAST_FORWARD_RELEASE', function() {
      mrc._commandHandler(AVRCP.FAST_FORWARD_RELEASE);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.SEEK_RELEASE);
      resetEvent();
    });
    test('AVRCP.REWIND_RELEASE', function() {
      mrc._commandHandler(AVRCP.REWIND_RELEASE);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.SEEK_RELEASE);
      resetEvent();
    });
  });

  suite('IAC commands', function() {
    test('IAC.PLAY_PAUSE_PRESS', function() {
      mrc._commandHandler(IAC.PLAY_PAUSE_PRESS);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.PLAY);
      resetEvent();
    });
    test('IAC.STOP_PRESS', function() {
      mrc._commandHandler(IAC.STOP_PRESS);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.STOP);
      resetEvent();
    });
    test('IAC.NEXT_PRESS', function() {
      mrc._commandHandler(IAC.NEXT_PRESS);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.NEXT);
      resetEvent();
    });
    test('IAC.PREVIOUS_PRESS', function() {
      mrc._commandHandler(IAC.PREVIOUS_PRESS);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.PREVIOUS);
      resetEvent();
    });
    test('IAC.FAST_FORWARD_PRESS', function() {
      mrc._commandHandler(IAC.FAST_FORWARD_PRESS);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.SEEK_PRESS);
      assert.equal(receivedEvent.detail.direction, true);
      resetEvent();
    });
    test('IAC.REWIND_PRESS', function() {
      mrc._commandHandler(IAC.REWIND_PRESS);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.SEEK_PRESS);
      assert.equal(receivedEvent.detail.direction, false);
      resetEvent();
    });
    test('IAC.FAST_FORWARD_RELEASE', function() {
      mrc._commandHandler(IAC.FAST_FORWARD_RELEASE);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.SEEK_RELEASE);
      resetEvent();
    });
    test('IAC.REWIND_RELEASE', function() {
      mrc._commandHandler(IAC.REWIND_RELEASE);
      assert.equal(receivedEvent.detail.command, REMOTE_CONTORLS.SEEK_RELEASE);
      resetEvent();
    });
  });
});
