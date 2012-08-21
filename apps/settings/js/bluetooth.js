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
  var gDeviceList = document.querySelector('#bluetooth-devices');

  var gDiscoveredDevices = new Array();
  var gPairedDevices = new Array();

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

      gBluetoothDefaultAdapter = null;
    };
  };

  function changePairedBT() {

		dump("changePairedBT()");

		if (!gBluetoothDefaultAdapter) {
			dump("BluetoothAdapter is null.");
			return;
		}

		dump("call getPairedDevices()");
		var req = gBluetoothDefaultAdapter.getPairedDevices();

		req.onsuccess = function bt_getPairedDevicesSuccess() {
			dump("getPairedDevice Success");
      gPairedDevices = req.result
			for (var i = 0; i < req.result.length; i++) {
				/*for (var property in gPairedDevices[i]) {
					dump(gPairedDevices[i][property]);
				}*/
        dump("paired device name: " + gPairedDevices[i].name);
			}
		}
    req.onerror = function bt_getPairedDevicesError() {
      dump("Error on get paired-devices");
    }
  }

  function changeUnpairBT() {
    var unpairDeviceId = null;
    for (var i = 0; i < gPairedDevices.length; i++) {
      if (gPairedDevices[i].name === "2XXPlantronics") {
        unpairDeviceId = i;
        dump("unpairDeviceId: " + i);
      }
    }
    var testReq = gBluetoothDefaultAdapter.unpair(gPairedDevices[unpairDeviceId]);

    testReq.onsuccess = function() {
      dump("[Gaia] Unpair " + gPairedDevices[unpairDeviceId].name + " done");
    };

    testReq.onerror = function() {
      dump("[Gaia] Unpair error");
    };

    return;
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

  function pairedItem(index, str) {
    var a2 = document.createElement('a2');
    a2.textContent = str;

    var span2 = document.createElement('span2');
    span2.className = 'bluetooth-search';

    var label2 = document.createElement('label2');
    label2.appendChild(span2);

    var li2 = document.createElement('li2');
    li2.appendChild(a2);
    li2.appendChild(label2);

    li2.oncli
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
      var req = gBluetoothDefaultAdapter.pair(device);

      dump("[Gaia] Start pairing")

      req.onsuccess = function bt_pairSuccess() {
        dump("[Gaia] Pairing done");

        device.onconnected = function() {
          dump("[Gaia] Connected");
        }

        device.ondisconnected = function() {
          dump("[Gaia] Disconnected");
        } 
      };

      req.onerror = function() {
        dump("[Gaia] Pairing failed");
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

  document.querySelector('#bluetooth-paired input').onchange = changePairedBT;
  document.querySelector('#bluetooth-unpair input').onchange = changeUnpairBT;
  document.querySelector('#bluetooth-discovery input').onchange = startStopDiscovery;
});

