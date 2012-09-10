/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var Bluetooth = {

  /* this property store a reference of the default adapter */
  defaultAdapter: null,

  /* this property store the array of paired devices we got from the
   * adapter */
  pairedDevices: [],

  /* keep a global connected property here */
  connected: false,

  init: function bt_init() {
    var settings = window.navigator.mozSettings;
    if (!settings)
      return;

    var bluetooth = window.navigator.mozBluetooth;
    var self = this;

    // XXX there is no "bluetooth.onenabled" callback can be hooked.
    // We will probe for setting enable callback instead for now.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=782586

    var enabled = false;
    SettingsListener.observe('bluetooth.enabled', true, function(value) {
      if (!bluetooth) {
        // roll back the setting value to notify the UIs
        // that Bluetooth interface is not available
        if (value) {
          settings.getLock().set({
            'bluetooth.enabled': false
          });
        } 
        return;
      }

     dump("[Gaia] settings: " + value);
     dump("[Gaia] enabled: " + enabled);
      if (value !== enabled && value) {
        // Setting value is not actually synced with Bluetooth device,
        // let's wait a bit before getting adapter.
/*        if (!bluetooth.enabled) {
          setTimeout(function timeout() {
            self.initDefaultAdapter();
          }, 5000);

          return;
        }*/
    if (enabled) {
      bluetooth.onenabled = function(evt) {
        dump("[Gaia] onenabled");
        if (bluetooth.enabled) {
          dump("[Gaia] toggle success");
          bluetooth.onadapteradded = function(evt) {
            dump("[Gaia] onadapteradded");
            initialDefaultAdapter();
            navigator.mozSetMessageHandler('bluetooth-requestconfirmation',
function gotMessage(message) {
              dump("[Gaia] bluetooth-requestconfirmation got message: " +
message.deviceAddress + ", " + message.passkey + ", " + message.name);
//              defaultAdapter.setPairingConfirmation(message.deviceAddress,
//              true);
            });
            navigator.mozSetMessageHandler('bluetooth-requestpasskey', function
gotMessage(message) {
              dump("[Gaia] bluetooth-requestpasskey got message: " +
message.deviceAddress + ", " + message.name);
            });
            navigator.mozSetMessageHandler('bluetooth-requestpincode', function
gotMessage(message) {
              dump("[Gaia] bluetooth-requestpincode got message: " +
message.deviceAddress + ", " + message.name);
            });

          };
        } else {
          dump("[Gaia] toggle failed");
        }
      };
    } else {
      bluetooth.ondisabled = function(evt) {
        dump("[Gaia] ondisabled");
        if (!bluetooth.enabled) {
          dump("[Gaia] toggle success");
        } else {
          dump("[Gaia] toggle failed");
        }
      };
    }

  }

        
      }
      enabled = value;
    });
  },

  initDefaultAdapter: function bt_initDefaultAdapter() {
    var bluetooth = window.navigator.mozBluetooth;
    var self = this;

    if (!bluetooth || this.defaultAdapter ||
        !('getDefaultAdapter' in bluetooth))
      return;

    var req = bluetooth.getDefaultAdapter();
    req.onsuccess = function bt_gotDefaultAdapter(evt) {
      var adapter =
        self.defaultAdapter = req.result;

      /* If we get adapter.ondeviceconnected and
      adapter.ondevicedisconnected, we can end here. But we don't...
      https://bugzilla.mozilla.org/show_bug.cgi?id=778640
      */

      self.updateDeviceList.call(self);

      /* We neither have adapter.ondevicepaired nor
      adapter.ondeviceunpaired, that leaves us with only
      adapter.ondevicefound to tackle */

      // New device is being found. Update the paired device list only
      // if it is being paired.
      adapter.ondevicefound = function bt_deviceFound(evt) {
        var device = evt.device;
        device.onpropertychanged = function bt_devicePropertychanged() {
          if (device.paired)
            self.updateDeviceList.bind(self);
        };
      };

      // We might have this callback or |device.ondisappeared|
      // put it here anyway.
      adapter.ondevicedisappeared = function bt_deviceDisappeared(evt) {
        var device = evt.device;
        device.onpropertychanged = null;
      };
    };
  },

  updateDeviceList: function bt_updateDeviceList() {
    var adapter = this.defaultAdapter;

    // adapter.getPairedDevices will be implemented in
    // https://bugzilla.mozilla.org/show_bug.cgi?id=777671
    if (!adapter.getPairedDevices)
      return;

    var self = this;
    var req = adapter.getPairedDevices();
    req.onsuccess = function bt_gotPairedDevices(evt) {
      var devices =
        self.pairedDevices = req.result;

      self.updateConnected.call(self);

      devices.forEach(function devices_forEach(device) {
        device.onpropertychanged = function bt_devicePropertychanged() {
          // Device is connected, update connected status
          if (device.connected)
            self.updateConnected.bind(self);

          // Device is unpaired, update the paired device list
          if (!device.paired)
            self.updateDeviceList.call(self);
        }

        // We might have this callback or |adapter.ondevicedisappeared|
        // put it here anyway.
        device.ondisappeared = function bt_deviceDisappeared() {
          device.onpropertychanged = null;
        };
      });

    }
  },

  updateConnected: function bt_updateConnected() {
    var wasConnected = this.connected;
    this.connected = this.pairedDevices.some(function(device) {
      return device.connected;
    });

    if (wasConnected !== this.connected) {
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent('bluetoothconnectionchange',
        /* canBubble */ true, /* cancelable */ false,
        {deviceConnected: this.connected});
      window.dispatchEvent(evt);
    }
  }
};

Bluetooth.init();
