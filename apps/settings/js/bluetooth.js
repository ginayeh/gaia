/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

// handle BlueTooth settings
window.addEventListener('localized', function bluetoothSettings(evt) {
  var _ = navigator.mozL10n.get;
  var settings = window.navigator.mozSettings;
  var gBluetoothManager = navigator.mozBluetooth;
  var gBluetoothDefaultAdapter = null;
  var gBluetoothInfoBlock = document.querySelector('#bluetooth-status small');
  var gBluetoothCheckBox = document.querySelector('#bluetooth-status input');
  var gBluetoothVisibility = document.querySelector('#bluetooth-visibility small');
  var gDeviceList = document.querySelector('#bluetooth-devices');
  var gDevice = null;

  var gDiscoveredDevices = new Array();

  // display Bluetooth power state
  function updatePowerState(value) {
    gBluetoothInfoBlock.textContent = value ? _('enabled') : _('disabled');
    gBluetoothCheckBox.checked = value;
  };

  function getDefaultAdapter() {
    var req = gBluetoothManager.getDefaultAdapter();

    req.onsuccess = function bt_getDefaultAdapterSuccess() {
      if (gBluetoothDefaultAdapter != null) { 
        dump("gBluetoothDefaultAdapter exsits.");
        return;
      }

      gBluetoothDefaultAdapter = req.result;

      dump("Gaia got Adapter: " + gBluetoothDefaultAdapter);

      gBluetoothDefaultAdapter.onrequestconfirmation = function(evt) {
        dump("[Gaia] Passkey = " + evt.passkey + ", request confirmation");
        dump("[Gaia] Device path = " + evt.deviceAddress);

        // TODO(Eric)
        // To respond to this event, we need to pop up a dialog to let user
        // check passkey. If it matches, call
        gBluetoothDefaultAdapter.setPairingConfirmation(evt.deviceAddress, true);
        // , or call
        // gBluetoothDefaultAdapter.setPairingConfirmationTemp(false)

        // TODO(Eric)
        // I did what SMS had done, use NotificationHelper to show a
        // notification on status bar.
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
        dump("[Gaia] Device "+ evt.device.address + " found!!!");
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

			gBluetoothDefaultAdapter.ondevicedisappeared = function(evt) {
        dump("[Gaia] Device "+ evt.deviceAddress+" disappeared!!!");
      };

    };

    req.onerror = function bt_getDefaultAdapterError() {
      dump("ADAPTER GET ERROR");
      dump(req.error.name);

      gBluetoothDefaultAdapter = null;
    };
  };


  function changeBtVisibility() {
    
	  var req = gBluetoothDefaultAdapter.unpair(gDevice);
    req.onsuccess = function(evt) {
			dump("unpair success");
    }
    req.onerror = function(evt) {
			dump("unpair error");
    }	
    return;

    if (!gBluetoothManager.enabled) {
      dump("Bluetooth has not enabled.");
      return;
    }

    if (this.checked == gBluetoothDefaultAdapter.discoverable) {
      dump("Same value, no action will be performed.");
      return;
    }

    dump("happy");

    var req = gBluetoothDefaultAdapter.setDiscoverable(this.checked);

    req.onsuccess = function bt_setDiscoverableSuccess() {
      gBluetoothVisibility.textContent = gBluetoothDefaultAdapter.discoverable ? 'visible' : 'invisible';
      dump("Discoverable: " + gBluetoothDefaultAdapter.discoverable);
    };

    req.onerror = function bt_setDiscoverableError() {
      dump("Error on set discoverable");
    };
  };

  function startStopDiscovery() {
    var req;

    if (this.checked) {
      gDiscoveredDevices.length = 0;
      clearList(gDeviceList);

      req = gBluetoothDefaultAdapter.startDiscovery();
    } else {
      req = gBluetoothDefaultAdapter.stopDiscovery();
    }

    req.onsuccess = function bt_startStopDiscovery() {
      dump("[Gaia] Start/Stop discovery ok.");
    };

    req.onerror = function bt_startStopDiscoveryFail() {
      dump("[Gaia] Start/Stop discovery failed.");
    };
  };

  function newScanItem(index, str) {
    var a = document.createElement('a');
    a.textContent = str;

    var span = document.createElement('span');
    span.className = 'bluetooth-search';

    var label = document.createElement('label');
    label.appendChild(span);

    var li = document.createElement('li');
    li.appendChild(a);
    li.appendChild(label);

    li.onclick = function() {
      var device = gDiscoveredDevices[index];
      gDevice = device;
      dump("[Gaia] device clicked!");
      var req_pair = gBluetoothDefaultAdapter.pair(device);
      dump("pairing request sent: "+ device.name);
      req_pair.onsuccess = function bt_pairSuccess() {
        dump("pairing request success");
        gDevice.onpropertychanged = function(evt) {
          dump("on property changed");
        }
        gDevice.onconnected = function(evt) {
          dump("on connected");
        }
        gDevice.ondisconnected = function(evt) {
          dump("on disconnected");
        }
      };

      req_pair.onerror = function() {
        dump("error on pairing, try to unpair");
        //var req2 = gBluetoothDefaultAdapter.unpair(device.address);
      };
    };

    return li;
  };

  function clearList(list) {
    while (list.hasChildNodes())
      list.removeChild(list.lastChild);
  };

  // activate main button
  gBluetoothCheckBox.onchange = function changeBT() {
    var req = gBluetoothManager.setEnabled(this.checked);

    req.onsuccess = function bt_enabledSuccess() {
      if (gBluetoothManager.enabled) {
        window.setTimeout(getDefaultAdapter, 1000);
      }

      updatePowerState(gBluetoothManager.enabled);

      var settings = window.navigator.mozSettings;
      if (settings) {
        settings.getLock().set({
          'bluetooth.enabled': gBluetoothManager.enabled
        });
      }
    };

    req.onerror = function bt_enabledError() {
      gBluetoothInfoBlock.textContent = 'Error';
      console.log("Error: Turning on/off bluetooth");
    };
  };

  document.querySelector('#bluetooth-visibility input').onchange = changeBtVisibility;
  document.querySelector('#bluetooth-discovery input').onchange = startStopDiscovery;
});

