// ==UserScript==
// @name         jpdb MIDI reviewer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Review jpdb.io cards with midi
// @author       Asayake
// @match        https://jpdb.io/review
// @icon         https://jpdb.io/favicon.ico
// @grant        none
// ==/UserScript==

function listInputsAndOutputs(midiAccess) {
  let i = 0;
  for (const entry of midiAccess.inputs) {
    const input = entry[1];
    console.log(
      i +
        `: ` +
        `Input port [type:'${input.type}']` +
        ` id:'${input.id}'` +
        ` manufacturer:'${input.manufacturer}'` +
        ` name:'${input.name}'` +
        ` version:'${input.version}'`
    );
    i++;
  }

  for (const entry of midiAccess.outputs) {
    const output = entry[1];
    console.log(
      `Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`
    );
  }
}

function midiToString(note) {
  switch (note % 12) {
    case 0:
      return "c";
    case 1:
      return "cs";
    case 2:
      return "d";
    case 3:
      return "ds";
    case 4:
      return "e";
    case 5:
      return "f";
    case 6:
      return "fs";
    case 7:
      return "g";
    case 8:
      return "gs";
    case 9:
      return "a";
    case 10:
      return "as";
    case 11:
      return "b";
  }
}

function isFrontOrBack() {
  let hidden = document.getElementsByClassName("review-hidden")[0];
  let visible = document.getElementsByClassName("review-reveal")[0];
  if (visible) {
    return "back";
  } else if (hidden) {
    return "front";
  } else {
    return "idk";
  }
}

function onMIDIMessage(event) {
  //Pressed
  if (event.data[0] === 0x90) {
    const note = event.data[1];
    const s = midiToString(note);
    timestamps[s] = event.timeStamp;
  }
  //Released
  else if (event.data[0] === 0x80) {
    const note = event.data[1];
    const s = midiToString(note);
    if (event.timeStamp - timestamps[s] > 500) {
      console.log("aborted");
      return;
    }
    if (isFrontOrBack() === "front") {
      document.getElementById("show-answer").click();
    }

    switch (s) {
      case "c":
        document.getElementById("grade-3").click();
        return;
      case "cs":
        document.getElementById("grade-1").click();
        return;
      case "d":
        document.getElementById("grade-4").click();
        return;
      case "ds":
        document.getElementById("grade-2").click();
        return;
      case "e":
        document.getElementById("grade-5").click();
        return;
    }
  }
}

function startLoggingMIDIInput(midiAccess, indexOfPort) {
  midiAccess.inputs.forEach((entry) => {
    entry.onmidimessage = onMIDIMessage;
  });
}

var timestamps = {};

(function () {
  "use strict";

  let midi = null; // global MIDIAccess object
  function onMIDISuccess(midiAccess) {
    console.log("MIDI ready!");
    midi = midiAccess; // store in the global (in real usage, would probably keep in an object instance)
    listInputsAndOutputs(midi);
    startLoggingMIDIInput(midi, 2);
  }

  function onMIDIFailure(msg) {
    console.error(`Failed to get MIDI access - ${msg}`);
  }

  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
})();
