//= require ./themes
//= require_directory ./themes
//= require_self

function gmap_with_markers(options) {
  var self = {
    dev: false,
    map: null,
    markers: [],
    latlngs: [],
    windows: [],
    multi_window: false,
    marker_icon: null,
    map_options: {
      center: null,
      zoom: null,
      disableDefaultUI: true,
      scrollwheel: false,
      zoomControl: true,
      panControl: false,  
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER
      }
    },
    themes: null
  };

  self.warn = function(message) {
    if (self.dev) {
      console.warn(message);
    }
  };

  self.info = function(message) {
    if (self.dev) {
      console.info(message);
    }
  };

  self.test_options = function(opt) {
    if (typeof opt !== 'object') {
      self.warn('Options was not set or was undefined.');
      return false;
    }

    if (!opt.hasOwnProperty('element')) {
      self.warn('Options must have an "element" property.');
      return false;
    }

    if (!(typeof opt.element.appendChild === 'function' ||
        (typeof opt.element === 'string' && document.getElementById(opt.element)))) {
      self.warn('Element must be an HTML element or the ID of one.');
      return false;
    }

    if (!opt.hasOwnProperty('center')) {
      self.warn('Options must have a "center" property.');
      return false;
    }

    if (!((typeof opt.center === 'string' && opt.center === 'auto') ||
        (typeof opt.center === 'object' && opt.center.hasOwnProperty('length')))) {
      self.warn('Center must be "auto" or an array.');
      return false;
    }

    if (typeof opt.center !== 'string') {
      if (opt.center.length !== 2) {
        self.warn('Center must only have two values.');
        return false;
      }

      if (isNaN(opt.center[0]) || isNaN(opt.center[1])) {
        self.warn('Center lat and lng must be numerical.');
        return false;
      }
    }

    if (!opt.hasOwnProperty('zoom')) {
      self.warn('Options must have "zoom" property.');
      return false;
    }

    if (!((typeof opt.zoom == 'string' && opt.zoom === 'auto') || !isNaN(opt.zoom))) {
      self.warn('Zoom must be "auto" or numerical.');
      return false;
    }

    if (opt.hasOwnProperty('theme')) {
      if (!(typeof opt.theme === 'string' ||
          (typeof opt.theme === 'object' && opt.theme.hasOwnProperty('length')))) {
        self.warn('Theme must either be a string or an array!');
      }
    }

    return true;
  };

  self.test_marker = function(marker) {
    if (!marker.hasOwnProperty('position')) {
      self.warn('Marker must have a "position" property.');
      return false;
    }

    if (typeof marker.position !== 'object' || !marker.position.hasOwnProperty('length')) {
      self.warn('Marker position must be an array.');
      return false;
    }

    if (marker.position.length !== 2) {
      self.warn('Marker postion must have only 2 values.');
      return false;
    }

    if (isNaN(marker.position[0]) || isNaN(marker.position[1])) {
      self.warn('Marker lat and lng must be numerical');
      return false;
    }

    return true;
  };

  self.create_marker = function(markerData) {
    var marker, infowindow, markerOpts, pos;

    pos = new google.maps.LatLng(markerData.position[0], markerData.position[1]);

    self.latlngs.push(pos);

    markerOpts = {
      map: self.map,
      position: pos,
      animation: google.maps.Animation.DROP
    };

    if (self.marker_icon !== null) {
      markerOpts.icon = self.marker_icon;
    }

    if (self.marker_shape !== null) {
      markerOpts.shape = self.marker_shape;
    }

    if (markerData.hasOwnProperty('title') && typeof markerData.title === 'string') {
      markerOpts.title = markerData.title;
    }

    if (markerData.hasOwnProperty('icon') && (typeof markerData.icon === 'string' ||
        (typeof markerData.icon === 'object' && markerData.icon.hasOwnProperty('url')))) {
      markerOpts.icon = markerData.icon;
    }

    if (markerData.hasOwnProperty('shape') && typeof markerData.shape === "object" &&
      markerData.shape.hasOwnProperty('coords') && markerData.shape.hasOwnProperty('type')) {
      markerOpts.shape = markerData.shape;
    }

    if (markerData.hasOwnProperty('title') && typeof markerData.title === 'string') {
      markerOpts.title = markerData.title;
    }

    marker = new google.maps.Marker(markerOpts);
    self.markers.push(marker);

    if (markerData.hasOwnProperty('info') && (typeof markerData.info == 'string' ||
        (typeof markerData.info === 'object' && typeof markerData.info.appendChild === 'function'))) {

      infowindow = new google.maps.InfoWindow({
        content: markerData.info
      });

      google.maps.event.addListener(marker, 'click', function() {

        if (!self.multi_window) {
          self.close_windows();
        }

        infowindow.open(self.map, marker);
      });

      self.windows.push(infowindow);
    }
  };

  self.close_windows = function() {
    var i;
    for (i = 0; i < self.windows.length; i++) {
      self.windows[i].close();
    }
  };

  self.process_markers = function(options) {
    var i, marker;

    if (options.hasOwnProperty('markers')) {
      if (typeof options.markers !== 'object' || !options.markers.hasOwnProperty('length')) {
        self.warn('Markers property exists, but not an array!');
        return false;
      }

      for (i = 0; i < options.markers.length; i++) {
        self.info('Processing marker ' + (i + 1));
        marker = options.markers[i];
        if (self.test_marker(marker)) {
          self.create_marker(marker);
        }
      }
    }
  };

  self.auto_adjust = function() {
    var i, bounds = new google.maps.LatLngBounds();

    for (i = 0; i < self.latlngs.length; i++) {
      bounds.extend(self.latlngs[i]);
    }

    if (options.zoom === 'auto') {
      self.map.fitBounds(bounds);
      google.maps.event.addListenerOnce(self.map, 'bounds_changed', function(event) {
        self.map.setZoom(self.map.getZoom() - 1);
      });
    }

    if (options.center === 'auto') {
      self.map.setCenter(bounds.getCenter());
    }
  };

  self.map_init = function() {
        
    self.map = new google.maps.Map(document.getElementById('map-canvas'), self.map_options);
    self.process_markers(options);

    if (options.center === 'auto' || options.zoom === 'auto') {
      self.auto_adjust(options);
    }

    if (typeof options.callback === 'function') {
      options.callback(self);
    }
  };

  if (typeof gmap_themes !== 'undefined') {
    if (options.hasOwnProperty('theme')) {
      if (typeof options.theme === 'string' && gmap_themes.themeExists(options.theme)) {
        self.map_options.styles = gmap_themes.getTheme(options.theme);
      } else if (typeof options.theme === 'object' && options.theme.hasOwnProperty('length')) {
        self.map_options.styles = options.theme;
      }
    }
  }

  if (options.hasOwnProperty('dev') && options.dev) {
    self.dev = true;
  }

  if (options.hasOwnProperty('multi_window') && options.multi_window) {
    self.multi_window = true;
  }

  if (options.hasOwnProperty('icon') && (typeof options.icon === 'string' ||
      (typeof options.icon === "object" && options.icon.hasOwnProperty('url')))) {
    self.marker_icon = options.icon;
  }

  if (options.hasOwnProperty('shape') && typeof options.shape === "object" &&
    options.shape.hasOwnProperty('coords') && options.shape.hasOwnProperty('type')) {
    markerOpts.marker_shape = options.shape;
  }

  if (options.hasOwnProperty('zoomControlOptions:') && typeof options.zoomControlOptions === "object"){
    self.map_options.zoomControlOptions = options.zoomControlOptions;
  }

  if (self.test_options(options)) {
    self.map_options.center = typeof options.center === 'string' ?
      new google.maps.LatLng(39.50, -98.35) :
      new google.maps.LatLng(parseFloat(options.center[0]), parseFloat(options.center[1]));

    self.map_options.zoom = isNaN(options.zoom) ? 4 : parseInt(options.zoom);

    google.maps.event.addDomListener(window, 'load', self.map_init);

  }
  return self;
}
