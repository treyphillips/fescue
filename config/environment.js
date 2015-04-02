/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'mowr',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    parseKeys: {
      applicationId: 'p47KFGIep1RlVyhaFepbpB3ScSbrAbv6W1qFIjXV',
      restApi: 'ECB10wqwm1k2VYkZKWOpTPfIHMjaGczRV96umuRK'
    },

    'simple-auth': {
      authorizer: 'authorizer:parse',
      crossOriginWhitelist: ['https://api.parse.com'],
      routeAfterAuthentication: 'options'
    },

    contentSecurityPolicy: {
      'report-uri': "'self'",
      'default-src': "'none'",
      'script-src': "'self'",
      'connect-src': "'self' https://api.parse.com",
      'img-src': "'self' http://files.parsetfss.com",
      'media-src': "'self'",
      'font-src': "'self' data: fonts.gstatic.com",
      'style-src': "'self' 'unsafe-inline' fonts.googleapis.com"
    }

  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.baseURL = '/fescue/';
  }

  return ENV;
};
