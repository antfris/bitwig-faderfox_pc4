loadAPI(11);

host.defineController("Faderfox", "PC4 Device Plus", "0.2", "fa46371e-5e65-4b54-9ebd-4d1e43cebfc6", "Stefan Windus & Anthony Frisby");
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
   //controlPageCursor1 = cursorDevice.createCursorRemoteControlsPage("Page 1", 8, "page1");
   //controlPageCursor2 = cursorDevice.createCursorRemoteControlsPage("Page 2", 8, "page2");

   // Create an array of remote control pages
   controlPages = [];
   for (var i = 1; i <= 10; i++) {
      controlPages.push(cursorDevice.createCursorRemoteControlsPage("Page " + i, 8, "page" + i));
   }

   cp1 = controlPages[0];
   cp2 = controlPages[1];

   println("PC4 initialized!");
}

// Called when a short MIDI message is received on MIDI input port 0.
function onMidi0(status, data1, data2) {

   // Checks if the MIDI data is a CC
   if (isChannelController(status))
   {
      // Check if the CC is within our range
      if (data1 >= CC_USER_RANGE_LO && data1 <= CC_USER_RANGE_HI)
      {
         // Get the index of the CC in our User Controls
         // And set the value of the control to the value of our CC
         var index = data1 - CC_USER_RANGE_LO;
         // Set the value of the control to data2 with a resolution of 128
         userControls.getControl(index).set(data2, 128);
      }

      if (data1 === 24) { // Assuming CC 24 is used for page switching
         var pageIndex = Math.floor(data2 / 12.8); // Maps 0-127 to 0-9
         if (pageIndex >= 0 && pageIndex < controlPages.length) {
            cp1 = controlPages[pageIndex];
            cp2 = controlPages[pageIndex + 1];
         }
      }

      // Check if the CC is within our range
      if (data1 >= CC_MACRO1_RANGE_LO && data1 <= CC_MACRO1_RANGE_HI)
      {
         // Get the index of the CC in our Macro Controls
         // And set the value of the control to the value of our CC
         var index = data1 - CC_MACRO1_RANGE_LO;
         cp1.getParameter(index).set(data2, 128);
      }

      // Check if the CC is within our range
      if (data1 >= CC_MACRO2_RANGE_LO && data1 <= CC_MACRO2_RANGE_HI)
      {
         // Get the index of the CC in our Macro Controls
         // And set the value of the control to the value of our CC
         var index = data1 - CC_MACRO2_RANGE_LO;
         cp2.getParameter(index).set(data2, 128);
      }
   }
}

function flush() {
   // TODO: Flush any output to your controller here.
}

function exit() {

}