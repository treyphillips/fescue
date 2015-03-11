/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp();


// ---------
// Bootstrap
// ---------

app.import('bower_components/bootstrap/dist/css/bootstrap.css');
app.import('bower_components/bootstrap/dist/css/bootstrap.css.map', {
  destDir: 'assets'
});
app.import('bower_components/bootstrap/dist/js/bootstrap.js');

// ---------------
// Bootstrap Fonts
// ---------------

app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.eot', {
  destDir: 'fonts'
});

app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.svg', {
  destDir: 'fonts'
});

app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf', {
  destDir: 'fonts'
});

app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff', {
  destDir: 'fonts'
});

// ----------------------
// Bootstrap Material CSS
// ----------------------

app.import('bower_components/bootstrap-material-design/dist/css/roboto.css');
app.import('bower_components/bootstrap-material-design/dist/css/roboto.css.map', {
  destDir: 'assets'
});

app.import('bower_components/bootstrap-material-design/dist/css/material-fullpalette.css');
app.import('bower_components/bootstrap-material-design/dist/css/material-fullpalette.css.map', {
  destDir: 'assets'
});


app.import('bower_components/bootstrap-material-design/dist/css/ripples.css');
app.import('bower_components/bootstrap-material-design/dist/css/ripples.css.map', {
  destDir: 'assets'
});

// ------------------------
// Arrive.js (for material)
// ------------------------

app.import('bower_components/arrive/minified/arrive.min.js');

// ---------------------
// Bootstrap Material JS
// ---------------------

app.import('bower_components/bootstrap-material-design/dist/js/ripples.js');
app.import('bower_components/bootstrap-material-design/dist/js/material.js');

// ------------------------
// Bootstrap Material Fonts
// ------------------------

app.import('bower_components/bootstrap-material-design/dist/fonts/Material-Design-Icons.eot', {
  destDir: 'fonts'
});

app.import('bower_components/bootstrap-material-design/dist/fonts/Material-Design-Icons.svg', {
  destDir: 'fonts'
});

app.import('bower_components/bootstrap-material-design/dist/fonts/Material-Design-Icons.ttf', {
  destDir: 'fonts'
});

app.import('bower_components/bootstrap-material-design/dist/fonts/Material-Design-Icons.woff', {
  destDir: 'fonts'
});

app.import('bower_components/bootstrap-material-design/fonts/RobotoDraftBold.woff', {
  destDir: 'fonts'
});

app.import('bower_components/bootstrap-material-design/fonts/RobotoDraftBold.woff2', {
  destDir: 'fonts'
});

app.import('bower_components/bootstrap-material-design/fonts/RobotoDraftItalic.woff', {
  destDir: 'fonts'
});

app.import('bower_components/bootstrap-material-design/fonts/RobotoDraftItalic.woff2', {
  destDir: 'fonts'
});

app.import('bower_components/bootstrap-material-design/fonts/RobotoDraftMedium.woff', {
  destDir: 'fonts'
});

app.import('bower_components/bootstrap-material-design/fonts/RobotoDraftMedium.woff2', {
  destDir: 'fonts'
});

app.import('bower_components/bootstrap-material-design/fonts/RobotoDraftRegular.woff', {
  destDir: 'fonts'
});

app.import('bower_components/bootstrap-material-design/fonts/RobotoDraftRegular.woff2', {
  destDir: 'fonts'
});

module.exports = app.toTree();
