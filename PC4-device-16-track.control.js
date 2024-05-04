loadAPI(11);

host.defineController("Faderfox", "PC4 Device 16 Track (page1, page2)", "0.2", "fa46371e-5e65-4b54-9ebd-4d1e43cebfc7", "Stefan Windus & Anthony Frisby");
host.defineMidiPorts(1, 1);

if (host.platformIsWindows())
{
   // TODO: Set the correct names of the ports for auto detection on Windows platform here
   // and uncomment this when port names are correct.
   // host.addDeviceNameBasedDiscoveryPair(["Input Port 0"], ["Output Port 0"]);
}
else if (host.platformIsMac())
{
   // TODO: Set the correct names of the ports for auto detection on Mac OSX platform here
   // and uncomment this when port names are correct.
   // host.addDeviceNameBasedDiscoveryPair(["Input Port 0"], ["Output Port 0"]);
}
else if (host.platformIsLinux())
{
   host.addDeviceNameBasedDiscoveryPair(["Faderfox PC4 MIDI 1"], ["Faderfox PC4 MIDI 1"]);
}

// Define the range of CCs
var CC_USER_RANGE_LO = 17;
var CC_USER_RANGE_HI = 23;
var CC_MACRO1_RANGE_LO = 1;
var CC_MACRO1_RANGE_HI = 8;
var CC_MACRO2_RANGE_LO = 9;
var CC_MACRO2_RANGE_HI = 16;

var tracks;

function init() {
   host.getMidiInPort(0).setMidiCallback(onMidi0);

   // Creates an array of user controls with the proper amount of CC#s
   userControls = host.createUserControls(CC_USER_RANGE_HI - CC_USER_RANGE_LO + 1);

   // Iterate over the userControls, and assign the CC# to each control. 
   for(var i = CC_USER_RANGE_LO; i<=CC_USER_RANGE_HI; i ++)
   {
      userControls.getControl(i - CC_USER_RANGE_LO).setLabel("CC" + i);
   }   
   
   // Get cursor device and controls
   cursorTrack = host.createCursorTrackSection(0, 8);
   cursorDevice = host.createCursorDevice();
   controlPageCursor = cursorDevice.createCursorRemoteControlsPage(8);
   controlPageCursor1 = cursorDevice.createCursorRemoteControlsPage("Page 1", 8, "page1");
   controlPageCursor2 = cursorDevice.createCursorRemoteControlsPage("Page 2", 8, "page2");

   tracks = host.createTrackBank(8, 0, 8, true);
   tracks.sceneBank().setIndication(true);

   println("PC4 initialized!");
}

let numberOfQuadrants = 8;
let lastQuadrant = 0;
let quadrant = 0;

// Called when a short MIDI message is received on MIDI input port 0.
function onMidi0(status, data1, data2) {

   // Checks if the MIDI data is a CC
   if (isChannelController(status))
   {
      // Handle track selection with CC 24
      if (data1 === 24) {

         // Select the track based on the CC value
         for (let i = 0; i < numberOfQuadrants; i++) {
            if (data2 < 128/numberOfQuadrants*(i+1)) {
               quadrant = i;
               break;
            }
         }
         
         if (quadrant !== lastQuadrant) {
            host.showPopupNotification(`Quadrant: ${quadrant}`);
            //host.showPopupNotification(data2);
               
            const trackSelected = quadrant;
            println(` T-[${trackSelected}]: Select and arm record`);
            for (let trackNumber = 0; trackNumber < 6; trackNumber++) {
               const track = tracks.getItemAt(trackNumber);
               if (trackNumber === trackSelected) {
                  track.selectInEditor();
                  track.arm().set(true);
               } else {
                  track.arm().set(false);
               }
            }
         }
         lastQuadrant = quadrant;
      }

      // Check if the CC is within our range
      if (data1 >= CC_USER_RANGE_LO && data1 <= CC_USER_RANGE_HI)
      {
         // Get the index of the CC in our User Controls
         // And set the value of the control to the value of our CC
         var index = data1 - CC_USER_RANGE_LO;
         userControls.getControl(index).set(data2, 128);
      }

      // Check if the CC is within our range
      if (data1 >= CC_MACRO1_RANGE_LO && data1 <= CC_MACRO1_RANGE_HI)
      {
         // Get the index of the CC in our Macro Controls
         // And set the value of the control to the value of our CC
         var index = data1 - CC_MACRO1_RANGE_LO;
         controlPageCursor.getParameter(index).set(data2, 128);
      }

      // Check if the CC is within our range
      if (data1 >= CC_MACRO2_RANGE_LO && data1 <= CC_MACRO2_RANGE_HI)
      {
         // Get the index of the CC in our Macro Controls
         // And set the value of the control to the value of our CC
         var index = data1 - CC_MACRO2_RANGE_LO;
         controlPageCursor2.getParameter(index).set(data2, 128);
      }
   }
}

function flush() {
   // TODO: Flush any output to your controller here.
}

function exit() {

}