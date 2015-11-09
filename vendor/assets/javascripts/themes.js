var gmap_themes = (function() {
  var self = {
    themes: {}
  };

  self.themeExists = function(theme) {
    theme = theme.replace('/-/g', '_');
    return self.themes.hasOwnProperty(theme);
  };

  self.getTheme = function(theme) {
    theme = theme.replace('/-/g', '_');
    if (self.themeExists(theme)) {
      return self.themes[theme];
    }
  };

  self.createTheme = function(name, theme) {
    name = name.replace('/-/g', '_');
    if (!self.themeExists(name)) {
      self.themes[name] = theme;
    }
  };

  return self;
})();
