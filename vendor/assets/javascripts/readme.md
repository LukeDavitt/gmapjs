```
google_map_with_markers({
  element: "map-canvas",    // required: id or dom element object to turn into map
  center: 'auto',           // required: 'auto' or an array of 2 floats e.x. [69.114, -86.2154]
  zoom: 'auto',             // required: 'auto' or an integer zoom level
  icon: 'pin.png',          // optional: url/location of icon to use for all markers
  markers: [                // array of marker objects
    {
      title: 'Marker Title',               // optional: title used for hover text of pin
      position: [39.1450, -86.1120],       // required: array with 2 values representing lat and lng
      info: '<div>Some stuff here</div>',   // optional: string or dom element object you want for the onclick info window
      icon: 'pin2.png'                     // optional: url of a marker-specific pin to use, overrides default
    }
  ],
  callback: function(gmap) { // optional: anything you want to run after markers are placed.
    // ...
  }
});
```