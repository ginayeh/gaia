/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

// create a fake mozBluetooth if required (e.g. desktop browser)
var gBluetooth = (function(window) {
  var navigator = window.navigator;
  if (('mozBluetooth' in navigator) && navigator.mozBluetooth) {
    dump("gBluetooth = navigator.mozBluetooth");
    return navigator.mozBluetooth;
  }

  var enabled = false;
  return {
    get enabled() {
      return enabled;
    },
    setEnabled: function(value) {
      enabled = value;
      return { // fake DOM request
        set onsuccess(callback) { setTimeout(callback, 500); },
        set onerror(callback) {}
      };
    }
  };
})(this);

// handle BlueTooth settings
window.addEventListener('localized', function bluetoothSettings(evt) {
  var _ = navigator.mozL10n.get;
  var settings = window.navigator.mozSettings;
  var gBluetoothInfoBlock = document.querySelector('#bluetooth-status small');
  var gBluetoothCheckBox = document.querySelector('#bluetooth-status input');
  var gBluetoothPairedInfoBlock = document.querySelector('#bluetooth-paired small');
  var gBluetoothPairedCheckBox = document.querySelector('#bluetooth-paired input');

  var gBluetoothDefaultAdapter = null;
  var gPairedDevices = null;

  // display Bluetooth power state
  function updatePowerState(value) {
    gBluetoothInfoBlock.textContent = value ? _('enabled') : _('disabled');
    gBluetoothCheckBox.checked = value;
    if (value) {
			dump("update Power State to enabled");
	    window.setTimeout(getDefaultAdapter, 1000);
    }
  }

  // activate main button
  gBluetoothCheckBox.onchange = function changeBT() {
    if (settings) {
      settings.getLock().set({'bluetooth.enabled': this.checked});
			dump("changeBT()");
    }
  };

  gBluetoothPairedCheckBox.onchange = function changePairedBT() {
		dump("changePairedBT()");
/*    if (!gBluetooth.enabled) {
      dump("Bluetooth has not enabled.");
      return;
    }*/

		if (!gBluetoothDefaultAdapter) {
			dump("BluetoothAdapter is null.");
			return;
		}
		
		dump("call getPairedDevices()");
    var req = gBluetoothDefaultAdapter.getPairedDevices();
    
    req.onsuccess = function bt_getPairedDevicesSuccess() {
			dump("getPairedDevice Success");
			gPairedDevices = req.result;
			dump(gPairedDevices.length);
			for (var i = 0; i < gPairedDevices.length; i++) {
				for (var property in gPairedDevices[i]) {
					dump(gPairedDevices[i][property]);
				}
			}
    };

    req.onerror = function bt_getPairedDevicesError() {
      dump("Error on get paired-devices");
    }
  };


  function getDefaultAdapter() {
    var req = gBluetooth.getDefaultAdapter();
    dump("call getDefaultAdapter()");
    req.onsuccess = function bt_getDefaultAdapterSuccess() {
      gBluetoothDefaultAdapter = req.result;

			dump("get Default Adapter Success");

      gBluetoothDefaultAdapter.onrequestconfirmation = function(evt) {
        dump("[Gaia] Passkey = " + evt.passkey + ", request confirmation");
        dump("[Gaia] Device path = " + evt.deviceAddress);

        gBluetoothDefaultAdapter.setPairingConfirmation(evt.deviceAddress, true)
        NotificationHelper.send("Bluetooth", "test", null);
      };
      
      gBluetoothDefaultAdapter.onrequestpincode = function(evt) {
        dump("[Gaia] We need to send a set of pin code back!");
        gBluetoothDefaultAdapter.setPinCode(evt.deviceAddress, "0000");
      };

      gBluetoothDefaultAdapter.onrequestpasskey = function(evt) {
        dump("[Gaia] We need to send a set of passkey back!");
      };

      gBluetoothDefaultAdapter.oncancel = function(evt) {
        dump("[Gaia] Cancel");
      };

      gBluetoothDefaultAdapter.ondevicefound = function(evt) {
        dump("[Gaia] Device found!!!");
        var i;
        var len = gDiscoveredDevices.length;

        for (i = 0;i < len;++i) {
          if (gDiscoveredDevices[i].address == evt.device.address) {
            break;
          }
        }

        if (i == len) {
          if (evt.device.name != "") {
            gDeviceList.appendChild(newScanItem(i, evt.device.name));
            gDiscoveredDevices[i] = evt.device;
          }
        }
      };
    };

    req.onerror = function bt_getDefaultAdapterError() {
      dump("ADAPTER GET ERROR");
      dump(req.error.name);
    }
  };

  var lastMozSettingValue = true;

  // enable Bluetooth if the related settings says so
  if (settings) {
    // register an observer to monitor bluetooth.enabled changes
    settings.addObserver('bluetooth.enabled', function(event) {
      if (lastMozSettingValue == event.settingValue)
        return;

      lastMozSettingValue = event.settingValue;
      updatePowerState(event.settingValue);
    });

    // startup, update status
    var req = settings.getLock().get('bluetooth.enabled');

    req.onsuccess = function bt_EnabledSuccess() {
      lastMozSettingValue = req.result['bluetooth.enabled'];
      updatePowerState(lastMozSettingValue);
    };
  }

});

