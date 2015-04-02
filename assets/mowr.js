/* jshint ignore:start */

/* jshint ignore:end */

define('mowr/adapters/request', ['exports', 'ember', 'ic-ajax'], function (exports, Ember, ajax) {

  'use strict';

  exports['default'] = Ember['default'].Object.extend({
    save: function save(type, record) {
      if (record.id) {
        return ajax['default']({
          url: "https://api.parse.com/1/classes/Request" + record.id,
          type: "PUT",
          data: JSON.stringify(record.toJSON())
        }).then(function (response) {
          record.updatedAt = response.updatedAt;
          return record;
        });
      } else {
        return ajax['default']({
          url: "https://api.parse.com/1/classes/Request",
          type: "POST",
          data: JSON.stringify(record.toJSON())
        }).then(function (response) {
          record.id = response.objectId;
          record.createdAt = response.createdAt;
          return record;
        });
      }
    },

    findQuery: function findQuery(name, query) {
      /* jshint unused: false */
      return ajax['default']("https://api.parse.com/1/classes/Request?include=createdBy", {
        data: {
          where: JSON.stringify({
            createdBy: {
              __type: "Pointer",
              className: "_User",
              objectId: query.user.id
            }
          })
        }
      }).then(function (response) {
        return response.results.map(function (request) {
          request.id = request.objectId;
          delete request.objectId;
          return request;
        });
      });
    },

    findAll: function findAll(name) {
      /* jshint unused: false */
      return ajax['default']("https://api.parse.com/1/classes/Request?include=createdBy").then(function (response) {
        return response.results.map(function (request) {
          request.id = request.objectId;
          delete request.objectId;
          return request;
        });
      });
    } });

});
define('mowr/adapters/user', ['exports', 'ic-ajax', 'ember'], function (exports, ajax, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Object.extend({

    save: function save(type, record) {
      console.log(record);
      if (record.id) {
        return ajax['default']({
          url: "https://api.parse.com/1/users/" + record.id,
          type: "PUT",
          data: JSON.stringify(record.toJSON())
        }).then(function (response) {
          record.updatedAt = response.updatedAt;
          return record;
        });
      } else {
        return ajax['default']({
          url: "https://api.parse.com/1/users/",
          type: "POST",
          data: JSON.stringify(record.toJSON())
        }).then(function (response) {
          record.id = response.objectId;
          record.createdAt = response.createdAt;
          record.sessionToken = response.sessionToken;
          return record;
        });
      }
    }

  });

});
define('mowr/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'mowr/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  var App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('mowr/authenticators/parse-email', ['exports', 'ic-ajax', 'simple-auth/authenticators/base', 'ember'], function (exports, ajax, Base, Ember) {

  'use strict';

  exports['default'] = Base['default'].extend({
    sessionToken: null,

    restore: function restore(data) {
      return new Ember['default'].RSVP.Promise(function (resolve, reject) {
        if (!Ember['default'].isEmpty(data.sessionToken)) {
          resolve(data);
        } else {
          reject();
        }
      });
    },

    authenticate: function authenticate(credentials) {
      var token = credentials.sessionToken;
      var endpoint = token ? "users/me" : "login";
      var options = token ? {
        headers: {
          "X-Parse-Session-Token": token
        }
      } : {
        data: {
          username: credentials.identification,
          password: credentials.password
        }
      };

      return ajax['default']("https://api.parse.com/1/" + endpoint, options).then((function (response) {
        response.id = response.objectId;
        delete response.objectId;
        var user = this.store.push("user", response);
        return { sessionToken: response.sessionToken, currentUser: user };
      }).bind(this));
    },

    invalidate: function invalidate() {
      return Ember['default'].RSVP.resolve();
    }
  });

});
define('mowr/authorizers/parse', ['exports', 'ember', 'simple-auth/authorizers/base', 'mowr/config/environment'], function (exports, Ember, Base, ENV) {

  'use strict';

  exports['default'] = Base['default'].extend({
    authorize: function authorize(jqXHR) {
      jqXHR.setRequestHeader("X-Parse-Application-Id", ENV['default'].parseKeys.applicationId);
      jqXHR.setRequestHeader("X-Parse-REST-API-Key", ENV['default'].parseKeys.restApi);

      var sessionToken = this.get("session.sessionToken");
      if (!Ember['default'].isEmpty(sessionToken)) {
        jqXHR.setRequestHeader("X-Parse-Session-Token", sessionToken);
      }
    }
  });

});
define('mowr/controllers/login', ['exports', 'ember', 'simple-auth/mixins/login-controller-mixin'], function (exports, Ember, LoginControllerMixin) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend(LoginControllerMixin['default'], {
    authenticator: "authenticator:parse-email"
  });

});
define('mowr/controllers/options', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({

    // names: ["customer", "contractor"],

    actions: {
      save: function save() {
        this.get("model").save().then(function () {
          console.log("Youre amazing!!!!");
        });

        this.transitionToRoute("loading");
        Ember['default'].run.later(this, function () {
          this.transitionToRoute("completed");
        }, 3000);
      }
    }
  });

});
define('mowr/controllers/profile-edit', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    actions: {
      saveProfile: function saveProfile() {
        this.get("session.currentUser").save();
        this.transitionToRoute("profile");
      }
    }
  });

});
define('mowr/controllers/profile', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({});

});
define('mowr/controllers/register', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({

    // names: ["customer", "contractor"],

    actions: {
      save: function save() {
        var self = this;
        var user = this.get("model");
        user.username = user.email;
        user.save().then(function () {
          self.get("session").authenticate("authenticator:parse-email", user);
        });
        this.transitionToRoute("options");
      }
    }
  });

});
define('mowr/helpers/fa-icon', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var FA_PREFIX = /^fa\-.+/;

  var warn = Ember['default'].Logger.warn;

  /**
   * Handlebars helper for generating HTML that renders a FontAwesome icon.
   *
   * @param  {String} name    The icon name. Note that the `fa-` prefix is optional.
   *                          For example, you can pass in either `fa-camera` or just `camera`.
   * @param  {Object} options Options passed to helper.
   * @return {Ember.Handlebars.SafeString} The HTML markup.
   */
  var faIcon = function faIcon(name, options) {
    if (Ember['default'].typeOf(name) !== "string") {
      var message = "fa-icon: no icon specified";
      warn(message);
      return Ember['default'].String.htmlSafe(message);
    }

    var params = options.hash,
        classNames = [],
        html = "";

    classNames.push("fa");
    if (!name.match(FA_PREFIX)) {
      name = "fa-" + name;
    }
    classNames.push(name);
    if (params.spin) {
      classNames.push("fa-spin");
    }
    if (params.flip) {
      classNames.push("fa-flip-" + params.flip);
    }
    if (params.rotate) {
      classNames.push("fa-rotate-" + params.rotate);
    }
    if (params.lg) {
      warn("fa-icon: the 'lg' parameter is deprecated. Use 'size' instead. I.e. {{fa-icon size=\"lg\"}}");
      classNames.push("fa-lg");
    }
    if (params.x) {
      warn("fa-icon: the 'x' parameter is deprecated. Use 'size' instead. I.e. {{fa-icon size=\"" + params.x + "\"}}");
      classNames.push("fa-" + params.x + "x");
    }
    if (params.size) {
      if (Ember['default'].typeOf(params.size) === "string" && params.size.match(/\d+/)) {
        params.size = Number(params.size);
      }
      if (Ember['default'].typeOf(params.size) === "number") {
        classNames.push("fa-" + params.size + "x");
      } else {
        classNames.push("fa-" + params.size);
      }
    }
    if (params.fixedWidth) {
      classNames.push("fa-fw");
    }
    if (params.listItem) {
      classNames.push("fa-li");
    }
    if (params.pull) {
      classNames.push("pull-" + params.pull);
    }
    if (params.border) {
      classNames.push("fa-border");
    }
    if (params.classNames && !Ember['default'].isArray(params.classNames)) {
      params.classNames = [params.classNames];
    }
    if (!Ember['default'].isEmpty(params.classNames)) {
      Array.prototype.push.apply(classNames, params.classNames);
    }

    html += "<";
    var tagName = params.tagName || "i";
    html += tagName;
    html += " class='" + classNames.join(" ") + "'";
    if (params.title) {
      html += " title='" + params.title + "'";
    }
    if (params.ariaHidden === undefined || params.ariaHidden) {
      html += " aria-hidden=\"true\"";
    }
    html += "></" + tagName + ">";
    return Ember['default'].String.htmlSafe(html);
  };

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(faIcon);

  exports.faIcon = faIcon;

});
define('mowr/initializers/app-version', ['exports', 'mowr/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;

  exports['default'] = {
    name: "App Version",
    initialize: function initialize(container, application) {
      var appName = classify(application.toString());
      Ember['default'].libraries.register(appName, config['default'].APP.version);
    }
  };

});
define('mowr/initializers/current-user', ['exports', 'ember', 'simple-auth/session', 'ic-ajax'], function (exports, Ember, Session, ajax) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {

    application.inject("adapter", "session", "simple-auth-session:main");
    application.inject("authenticator:parse-email", "store", "store:main");

    Session['default'].reopen({
      setCurrentUser: (function () {
        var token = this.get("sessionToken");

        if (this.get("isAuthenticated") && !Ember['default'].isEmpty(token)) {
          var store = container.lookup("store:main");
          ajax['default']("https://api.parse.com/1/users/me").then((function (response) {
            response.id = response.objectId;
            delete response.objectId;
            delete response.sessionToken;
            var user = store.push("user", response);
            this.set("currentUser", user);
          }).bind(this));
        }
      }).observes("sessionToken")
    });
  }

  exports['default'] = {
    name: "current-user",
    initialize: initialize
  };

});
define('mowr/initializers/ember-magic-man', ['exports', 'ember-magic-man/store'], function (exports, Store) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    application.register("store:main", Store['default']);

    application.inject("route", "store", "store:main");
    application.inject("controller", "store", "store:main");
    application.inject("model", "store", "store:main");
  }

  exports['default'] = {
    name: "ember-magic-man",
    initialize: initialize
  };

});
define('mowr/initializers/export-application-global', ['exports', 'ember', 'mowr/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  }

  ;

  exports['default'] = {
    name: "export-application-global",

    initialize: initialize
  };

});
define('mowr/initializers/parse', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.initialize = initialize;

  function initialize() {
    Ember['default'].$.ajaxSetup({
      headers: {
        "X-Parse-Application-Id": "p47KFGIep1RlVyhaFepbpB3ScSbrAbv6W1qFIjXV",
        "X-Parse-REST-API-Key": "ECB10wqwm1k2VYkZKWOpTPfIHMjaGczRV96umuRK"
      }
    });
  }

  exports['default'] = {
    name: "parse-tokens",
    initialize: initialize
  };
  /*container, application*/

});
define('mowr/initializers/simple-auth', ['exports', 'simple-auth/configuration', 'simple-auth/setup', 'mowr/config/environment'], function (exports, Configuration, setup, ENV) {

  'use strict';

  exports['default'] = {
    name: "simple-auth",
    initialize: function initialize(container, application) {
      Configuration['default'].load(container, ENV['default']["simple-auth"] || {});
      setup['default'](container, application);
    }
  };

});
define('mowr/models/options', ['exports', 'ember-magic-man/model'], function (exports, Model) {

	'use strict';

	exports['default'] = Model['default'].extend({});

});
define('mowr/models/request', ['exports', 'ember-magic-man/model'], function (exports, Model) {

  'use strict';

  exports['default'] = Model['default'].extend({
    toJSON: function toJSON() {
      var data = this._super();

      var userId = this.get("createdBy.id");
      if (userId) {
        data.set("createdBy", {
          __type: "Pointer",
          className: "_User",
          objectId: userId
        });
      }

      return data;
    }
  });

});
define('mowr/models/user', ['exports', 'ic-ajax', 'ember-magic-man/model'], function (exports, ajax, Model) {

  'use strict';

  exports['default'] = Model['default'].extend({

    addFavorite: function addFavorite(bookmark) {
      return ajax['default']("https://api.parse.com/1/users/" + this.id, {
        type: "PUT",
        data: JSON.stringify({
          favorites: {
            __op: "AddRelation",
            objects: [{
              __type: "Pointer",
              className: "user",
              objectId: bookmark.id
            }]
          }
        })
      });
    }
  });

});
define('mowr/router', ['exports', 'ember', 'mowr/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.route("register");
    this.route("login");
    this.route("options");
    this.route("landing", { path: "/" });
    this.route("completed");
    this.route("profile");
    this.route("profile-edit");
    this.route("loading");
    this.route("contractor");
  });

  exports['default'] = Router;

});
define('mowr/routes/application', ['exports', 'ember', 'simple-auth/mixins/application-route-mixin'], function (exports, Ember, ApplicationRouteMixin) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend(ApplicationRouteMixin['default'], {});

});
define('mowr/routes/completed', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('mowr/routes/contractor', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model() {
      return this.store.findAll("request");
    }
  });

});
define('mowr/routes/landing', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('mowr/routes/loading', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('mowr/routes/login', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('mowr/routes/options', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    beforeModel: function beforeModel() {
      if (this.get("session.currentUser.custOrcont") === "Contractor") {
        this.transitionTo("contractor");
      }
    },

    model: function model() {
      return this.store.createRecord("request", {
        createdBy: this.get("session.currentUser")
      });
    } });

});
define('mowr/routes/profile-edit', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('mowr/routes/profile', ['exports', 'simple-auth/mixins/authenticated-route-mixin', 'ember'], function (exports, AuthenticatedRouteMixin, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend(AuthenticatedRouteMixin['default'], {
    model: function model() {
      return this.store.findQuery("request", {
        user: this.get("session.currentUser")
      });
    }
  });

});
define('mowr/routes/register', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function model() {
      return this.store.createRecord("user");
    } });

});
define('mowr/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          var el2 = dom.createTextNode("Logout  |");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [1]);
          element(env, element1, context, "action", ["invalidateSession"], {});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          var el2 = dom.createTextNode("Login  |");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          element(env, element0, context, "action", ["authenticateSession"], {});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createElement("div");
          dom.setAttribute(el0,"class","prof-button");
          var el1 = dom.createTextNode("Profile");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","logged-in");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","header");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h1");
        dom.setAttribute(el2,"class","title");
        var el3 = dom.createTextNode("Fescue");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment("\n<div class=\"footer\">\n  <ul>\n  <li><span>{{fa-icon \"envelope-o\"}}</span><p>tlphillipsjr@gmail.com</p></li>\n  <li><span>{{fa-icon \"phone\"}}</span><p>864.590.5766</p></li>\n  <li><span>{{fa-icon \"twitter\"}}</span><p>@treyphillips</p></li>\n  <li><span>{{fa-icon \"github\"}}</span><p>treyphillips</p></li>\n</ul>\n</div> ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" <div class=\"foot-words\">\n  <p>tlphillipsjr@gmail.com</p>\n  <p>864.590.5766</p>\n  <p>@treyphillips</p>\n</div> ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,-1);
        var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
        var morph2 = dom.createMorphAt(fragment,8,9,contextualElement);
        block(env, morph0, context, "if", [get(env, context, "session.isAuthenticated")], {}, child0, child1);
        block(env, morph1, context, "link-to", ["profile"], {}, child2, null);
        content(env, morph2, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('mowr/templates/completed', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","completed");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("p");
        var el3 = dom.createTextNode("A lawn care professional is on their way. You will receive a confirmation email soon!");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('mowr/templates/contractor', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createElement("div");
          dom.setAttribute(el0,"class","prof-edit-button");
          var el1 = dom.createTextNode("Edit");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","single-request");
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          dom.setAttribute(el2,"class","contractor-names");
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","single-request-title");
          var el4 = dom.createTextNode(" Name:");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("  ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","single-request-title");
          var el4 = dom.createTextNode("Land Size:");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(" acres");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","single-request-title");
          var el4 = dom.createTextNode("Shrubs need trimming:");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(" ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n          ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createElement("div");
          dom.setAttribute(el3,"class","single-request-title");
          var el4 = dom.createTextNode("Brush:");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(" ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var element1 = dom.childAt(element0, [1]);
          var morph0 = dom.createMorphAt(element1,0,1);
          var morph1 = dom.createMorphAt(element1,1,-1);
          var morph2 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
          var morph3 = dom.createMorphAt(dom.childAt(element0, [5]),1,-1);
          var morph4 = dom.createMorphAt(dom.childAt(element0, [7]),1,-1);
          content(env, morph0, context, "request.createdBy.firstName");
          content(env, morph1, context, "request.createdBy.lastName");
          content(env, morph2, context, "request.acreage");
          content(env, morph3, context, "request.shrub");
          content(env, morph4, context, "request.brush");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","profile-info");
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","contractor-headline");
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Open Requests:");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","contractor-requests");
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        var el4 = dom.createTextNode("\n\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("  ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment(" <div class=\"profile-headline\">\n<h2>Yard Info:</h2>\n</div>\n{{#each request in model}}\n<ul>\n\n</ul>\n\n{{/each}} ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, block = hooks.block, get = hooks.get;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
        var morph2 = dom.createMorphAt(dom.childAt(fragment, [3, 3, 1]),0,1);
        content(env, morph0, context, "outlet");
        block(env, morph1, context, "link-to", ["profile-edit"], {}, child0, null);
        block(env, morph2, context, "each", [get(env, context, "model")], {"keyword": "request"}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('mowr/templates/landing', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createElement("div");
          dom.setAttribute(el0,"class","login-button");
          var el1 = dom.createTextNode("Login");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createElement("div");
          dom.setAttribute(el0,"class","register-button");
          var el1 = dom.createTextNode("Register");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","color-block");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","landing-elevator");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("p");
        var el4 = dom.createTextNode("Fescue connects you with a lawncare professional in minutes.");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("span");
        dom.setAttribute(el3,"class","land-buttons");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" <div class=\"land-buttons\">\n  <button>Login</button>\n  <button>Register</button>\n</div> ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var element0 = dom.childAt(fragment, [2, 1, 3]);
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        var morph1 = dom.createMorphAt(element0,-1,0);
        var morph2 = dom.createMorphAt(element0,0,-1);
        content(env, morph0, context, "outlet");
        block(env, morph1, context, "link-to", ["login"], {}, child0, null);
        block(env, morph2, context, "link-to", ["register"], {}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('mowr/templates/loading', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("p");
        dom.setAttribute(el1,"class","loading-words");
        var el2 = dom.createTextNode("We're finding a contractor to send to you!");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","loader");
        dom.setAttribute(el1,"title","2");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        dom.setNamespace("http://www.w3.org/2000/svg");
        var el2 = dom.createElement("svg");
        dom.setAttribute(el2,"version","1.1");
        dom.setAttribute(el2,"id","loader-1");
        dom.setAttribute(el2,"xmlns","http://www.w3.org/2000/svg");
        dom.setAttribute(el2,"xmlns:xlink","http://www.w3.org/1999/xlink");
        dom.setAttribute(el2,"x","0px");
        dom.setAttribute(el2,"y","0px");
        dom.setAttribute(el2,"width","150px");
        dom.setAttribute(el2,"height","150px");
        dom.setAttribute(el2,"viewBox","0 0 50 50");
        dom.setAttribute(el2,"style","enable-background:new 0 0 50 50;");
        dom.setAttributeNS(el2,"http://www.w3.org/XML/1998/namespace","xml:space","preserve");
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("path");
        dom.setAttribute(el3,"fill","#000");
        dom.setAttribute(el3,"d","M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z");
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("animateTransform");
        dom.setAttribute(el4,"attributeType","xml");
        dom.setAttribute(el4,"attributeName","transform");
        dom.setAttribute(el4,"type","rotate");
        dom.setAttribute(el4,"from","0 25 25");
        dom.setAttribute(el4,"to","360 25 25");
        dom.setAttribute(el4,"dur","0.6s");
        dom.setAttribute(el4,"repeatCount","indefinite");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('mowr/templates/login', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode(" ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("fieldset");
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","login-form");
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"type","submit");
        var el5 = dom.createTextNode("Login");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n    ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, element = hooks.element, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [2]);
        var element1 = dom.childAt(element0, [1, 1]);
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        var morph1 = dom.createMorphAt(element1,0,1);
        var morph2 = dom.createMorphAt(element1,1,2);
        content(env, morph0, context, "outlet");
        element(env, element0, context, "action", ["authenticate"], {"on": "submit"});
        inline(env, morph1, context, "input", [], {"value": get(env, context, "identification"), "placeholder": "Enter Email", "type": "email"});
        inline(env, morph2, context, "input", [], {"value": get(env, context, "password"), "placeholder": "Enter Password", "type": "password"});
        return fragment;
      }
    };
  }()));

});
define('mowr/templates/options', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("fieldset");
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","options-form");
        var el4 = dom.createTextNode("\n\n  ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n  ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n  ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        var el5 = dom.createTextNode("Submit");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, element = hooks.element, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var element0 = dom.childAt(fragment, [2]);
        var element1 = dom.childAt(element0, [1, 1]);
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        var morph1 = dom.createMorphAt(element1,0,1);
        var morph2 = dom.createMorphAt(element1,1,2);
        var morph3 = dom.createMorphAt(element1,2,3);
        content(env, morph0, context, "outlet");
        element(env, element0, context, "action", ["save"], {"on": "submit"});
        inline(env, morph1, context, "input", [], {"type": "text", "name": "acreage", "placeholder": "How many acres do you have?", "value": get(env, context, "model.acreage"), "required": true});
        inline(env, morph2, context, "input", [], {"type": "text", "name": "shrub", "placeholder": "Do you have shrubs that need trimming?", "value": get(env, context, "model.shrub"), "required": true});
        inline(env, morph3, context, "input", [], {"type": "text", "name": "brush", "placeholder": "Do you have leaves or other brush that requires hauling off?", "value": get(env, context, "model.brush"), "required": true});
        return fragment;
      }
    };
  }()));

});
define('mowr/templates/profile-edit', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("fieldset");
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","reg-form");
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","reg-button");
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"class","reg-button");
        var el6 = dom.createTextNode("Submit");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n    ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n  ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, element = hooks.element, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var element0 = dom.childAt(fragment, [2]);
        var element1 = dom.childAt(element0, [1, 1]);
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        var morph1 = dom.createMorphAt(element1,0,1);
        var morph2 = dom.createMorphAt(element1,1,2);
        var morph3 = dom.createMorphAt(element1,2,3);
        var morph4 = dom.createMorphAt(element1,3,4);
        var morph5 = dom.createMorphAt(element1,4,5);
        var morph6 = dom.createMorphAt(element1,5,6);
        var morph7 = dom.createMorphAt(element1,6,7);
        var morph8 = dom.createMorphAt(element1,7,8);
        content(env, morph0, context, "outlet");
        element(env, element0, context, "action", ["saveProfile"], {"on": "submit"});
        inline(env, morph1, context, "input", [], {"type": "text", "name": "email", "placeholder": "Email Address", "value": get(env, context, "session.currentUser.email"), "required": true});
        inline(env, morph2, context, "input", [], {"type": "text", "name": "firstName", "placeholder": "First Name", "value": get(env, context, "session.currentUser.firstName"), "required": true});
        inline(env, morph3, context, "input", [], {"type": "text", "name": "lastName", "placeholder": "Last Name", "value": get(env, context, "session.currentUser.lastName"), "required": true});
        inline(env, morph4, context, "input", [], {"type": "text", "name": "address", "placeholder": "Address", "value": get(env, context, "session.currentUser.address"), "required": true});
        inline(env, morph5, context, "input", [], {"type": "text", "name": "city", "placeholder": "City", "value": get(env, context, "session.currentUser.city"), "required": true});
        inline(env, morph6, context, "input", [], {"type": "text", "name": "zipCode", "placeholder": "Zip Code", "value": get(env, context, "session.currentUser.zipCode"), "required": true});
        inline(env, morph7, context, "input", [], {"type": "text", "name": "state", "placeholder": "State", "value": get(env, context, "session.currentUser.state"), "required": true});
        inline(env, morph8, context, "input", [], {"type": "text", "name": "phone", "placeholder": "Phone Number", "value": get(env, context, "session.currentUser.phone"), "required": true});
        return fragment;
      }
    };
  }()));

});
define('mowr/templates/profile', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createElement("div");
          dom.setAttribute(el0,"class","prof-edit-button");
          var el1 = dom.createTextNode("Edit");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createElement("ul");
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createTextNode(" acres");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createTextNode("Shrubs need trimming: ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n  ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("li");
          var el3 = dom.createTextNode("Brush: ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [0]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),-1,0);
          var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),0,-1);
          var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),0,-1);
          content(env, morph0, context, "request.acreage");
          content(env, morph1, context, "request.shrub");
          content(env, morph2, context, "request.brush");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","profile-info");
        var el2 = dom.createTextNode("\n\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","profile-headline");
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Contact Info:");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("ul");
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createTextNode(" ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("li");
        var el4 = dom.createTextNode(", ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode(", ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","profile-headline");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Yard Info:");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, block = hooks.block, get = hooks.get;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var element1 = dom.childAt(fragment, [3]);
        var element2 = dom.childAt(element1, [3]);
        var element3 = dom.childAt(element2, [1]);
        var element4 = dom.childAt(element2, [7]);
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        var morph1 = dom.createMorphAt(fragment,1,2,contextualElement);
        var morph2 = dom.createMorphAt(element3,-1,0);
        var morph3 = dom.createMorphAt(element3,0,-1);
        var morph4 = dom.createMorphAt(dom.childAt(element2, [3]),-1,-1);
        var morph5 = dom.createMorphAt(dom.childAt(element2, [5]),-1,-1);
        var morph6 = dom.createMorphAt(element4,-1,0);
        var morph7 = dom.createMorphAt(element4,0,1);
        var morph8 = dom.createMorphAt(element4,1,-1);
        var morph9 = dom.createMorphAt(element1,6,-1);
        content(env, morph0, context, "outlet");
        block(env, morph1, context, "link-to", ["profile-edit"], {}, child0, null);
        content(env, morph2, context, "session.currentUser.firstName");
        content(env, morph3, context, "session.currentUser.lastName");
        content(env, morph4, context, "session.currentUser.phone");
        content(env, morph5, context, "session.currentUser.address");
        content(env, morph6, context, "session.currentUser.city");
        content(env, morph7, context, "session.currentUser.state");
        content(env, morph8, context, "session.currentUser.zipCode");
        block(env, morph9, context, "each", [get(env, context, "model")], {"keyword": "request"}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('mowr/templates/register', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("form");
        var el2 = dom.createTextNode("\n  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("fieldset");
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","reg-form");
        var el4 = dom.createTextNode("\n\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n      ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n\n    ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","reg-button");
        var el5 = dom.createTextNode("\n      ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("button");
        dom.setAttribute(el5,"class","reg-button");
        var el6 = dom.createTextNode("Submit");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n    ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n  ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n  ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, element = hooks.element, get = hooks.get, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var element0 = dom.childAt(fragment, [2]);
        var element1 = dom.childAt(element0, [1, 1]);
        var element2 = dom.childAt(element1, [11, 1]);
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        var morph1 = dom.createMorphAt(element1,0,1);
        var morph2 = dom.createMorphAt(element1,1,2);
        var morph3 = dom.createMorphAt(element1,2,3);
        var morph4 = dom.createMorphAt(element1,3,4);
        var morph5 = dom.createMorphAt(element1,4,5);
        var morph6 = dom.createMorphAt(element1,5,6);
        var morph7 = dom.createMorphAt(element1,6,7);
        var morph8 = dom.createMorphAt(element1,7,8);
        var morph9 = dom.createMorphAt(element1,8,9);
        var morph10 = dom.createMorphAt(element1,9,10);
        content(env, morph0, context, "outlet");
        element(env, element0, context, "action", ["register"], {"on": "submit"});
        inline(env, morph1, context, "input", [], {"type": "text", "name": "custOrcont", "placeholder": "Are you a customer or contractor", "value": get(env, context, "model.custOrcont"), "required": true});
        inline(env, morph2, context, "input", [], {"type": "text", "name": "email", "placeholder": "Email Address", "value": get(env, context, "model.email"), "required": true});
        inline(env, morph3, context, "input", [], {"type": "password", "name": "password", "placeholder": "Choose Password", "value": get(env, context, "model.password"), "required": true});
        inline(env, morph4, context, "input", [], {"type": "text", "name": "firstName", "placeholder": "First Name", "value": get(env, context, "model.firstName"), "required": true});
        inline(env, morph5, context, "input", [], {"type": "text", "name": "lastName", "placeholder": "Last Name", "value": get(env, context, "model.lastName"), "required": true});
        inline(env, morph6, context, "input", [], {"type": "text", "name": "address", "placeholder": "Address", "value": get(env, context, "model.address"), "required": true});
        inline(env, morph7, context, "input", [], {"type": "text", "name": "city", "placeholder": "City", "value": get(env, context, "model.city"), "required": true});
        inline(env, morph8, context, "input", [], {"type": "text", "name": "zipCode", "placeholder": "Zip Code", "value": get(env, context, "model.zipCode"), "required": true});
        inline(env, morph9, context, "input", [], {"type": "text", "name": "state", "placeholder": "State", "value": get(env, context, "model.state"), "required": true});
        inline(env, morph10, context, "input", [], {"type": "text", "name": "phone", "placeholder": "Phone Number", "value": get(env, context, "model.phone"), "required": true});
        element(env, element2, context, "action", ["save"], {});
        return fragment;
      }
    };
  }()));

});
define('mowr/tests/adapters/request.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/request.js should pass jshint', function() { 
    ok(true, 'adapters/request.js should pass jshint.'); 
  });

});
define('mowr/tests/adapters/user.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/user.js should pass jshint', function() { 
    ok(true, 'adapters/user.js should pass jshint.'); 
  });

});
define('mowr/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('mowr/tests/authenticators/parse-email.jshint', function () {

  'use strict';

  module('JSHint - authenticators');
  test('authenticators/parse-email.js should pass jshint', function() { 
    ok(true, 'authenticators/parse-email.js should pass jshint.'); 
  });

});
define('mowr/tests/authorizers/parse.jshint', function () {

  'use strict';

  module('JSHint - authorizers');
  test('authorizers/parse.js should pass jshint', function() { 
    ok(true, 'authorizers/parse.js should pass jshint.'); 
  });

});
define('mowr/tests/controllers/login.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/login.js should pass jshint', function() { 
    ok(true, 'controllers/login.js should pass jshint.'); 
  });

});
define('mowr/tests/controllers/options.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/options.js should pass jshint', function() { 
    ok(true, 'controllers/options.js should pass jshint.'); 
  });

});
define('mowr/tests/controllers/profile-edit.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/profile-edit.js should pass jshint', function() { 
    ok(true, 'controllers/profile-edit.js should pass jshint.'); 
  });

});
define('mowr/tests/controllers/profile.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/profile.js should pass jshint', function() { 
    ok(true, 'controllers/profile.js should pass jshint.'); 
  });

});
define('mowr/tests/controllers/register.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/register.js should pass jshint', function() { 
    ok(true, 'controllers/register.js should pass jshint.'); 
  });

});
define('mowr/tests/helpers/resolver', ['exports', 'ember/resolver', 'mowr/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('mowr/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('mowr/tests/helpers/start-app', ['exports', 'ember', 'mowr/app', 'mowr/router', 'mowr/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('mowr/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('mowr/tests/initializers/current-user.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/current-user.js should pass jshint', function() { 
    ok(true, 'initializers/current-user.js should pass jshint.'); 
  });

});
define('mowr/tests/initializers/parse.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/parse.js should pass jshint', function() { 
    ok(true, 'initializers/parse.js should pass jshint.'); 
  });

});
define('mowr/tests/models/options.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/options.js should pass jshint', function() { 
    ok(true, 'models/options.js should pass jshint.'); 
  });

});
define('mowr/tests/models/request.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/request.js should pass jshint', function() { 
    ok(true, 'models/request.js should pass jshint.'); 
  });

});
define('mowr/tests/models/user.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/user.js should pass jshint', function() { 
    ok(true, 'models/user.js should pass jshint.'); 
  });

});
define('mowr/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('mowr/tests/routes/application.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/application.js should pass jshint', function() { 
    ok(true, 'routes/application.js should pass jshint.'); 
  });

});
define('mowr/tests/routes/completed.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/completed.js should pass jshint', function() { 
    ok(true, 'routes/completed.js should pass jshint.'); 
  });

});
define('mowr/tests/routes/contractor.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/contractor.js should pass jshint', function() { 
    ok(true, 'routes/contractor.js should pass jshint.'); 
  });

});
define('mowr/tests/routes/landing.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/landing.js should pass jshint', function() { 
    ok(true, 'routes/landing.js should pass jshint.'); 
  });

});
define('mowr/tests/routes/loading.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/loading.js should pass jshint', function() { 
    ok(true, 'routes/loading.js should pass jshint.'); 
  });

});
define('mowr/tests/routes/login.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/login.js should pass jshint', function() { 
    ok(true, 'routes/login.js should pass jshint.'); 
  });

});
define('mowr/tests/routes/options.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/options.js should pass jshint', function() { 
    ok(true, 'routes/options.js should pass jshint.'); 
  });

});
define('mowr/tests/routes/profile-edit.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/profile-edit.js should pass jshint', function() { 
    ok(true, 'routes/profile-edit.js should pass jshint.'); 
  });

});
define('mowr/tests/routes/profile.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/profile.js should pass jshint', function() { 
    ok(true, 'routes/profile.js should pass jshint.'); 
  });

});
define('mowr/tests/routes/register.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/register.js should pass jshint', function() { 
    ok(true, 'routes/register.js should pass jshint.'); 
  });

});
define('mowr/tests/test-helper', ['mowr/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('mowr/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/adapters/request-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("adapter:request", "RequestAdapter", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('mowr/tests/unit/adapters/request-test.jshint', function () {

  'use strict';

  module('JSHint - unit/adapters');
  test('unit/adapters/request-test.js should pass jshint', function() { 
    ok(true, 'unit/adapters/request-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/adapters/user-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("adapter:register", "RegisterAdapter", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('mowr/tests/unit/adapters/user-test.jshint', function () {

  'use strict';

  module('JSHint - unit/adapters');
  test('unit/adapters/user-test.js should pass jshint', function() { 
    ok(true, 'unit/adapters/user-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/components/x-toggle-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForComponent("x-toggle", {});

  ember_qunit.test("it renders", function (assert) {
    assert.expect(2);

    // creates the component instance
    var component = this.subject();
    assert.equal(component._state, "preRender");

    // renders the component to the page
    this.render();
    assert.equal(component._state, "inDOM");
  });

  // specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']

});
define('mowr/tests/unit/components/x-toggle-test.jshint', function () {

  'use strict';

  module('JSHint - unit/components');
  test('unit/components/x-toggle-test.js should pass jshint', function() { 
    ok(true, 'unit/components/x-toggle-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/controllers/login-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:login", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mowr/tests/unit/controllers/login-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/login-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/login-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/controllers/options-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:options", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mowr/tests/unit/controllers/options-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/options-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/options-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/controllers/profile-edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:profile-edit", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mowr/tests/unit/controllers/profile-edit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/profile-edit-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/profile-edit-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/controllers/profile-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:profile", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mowr/tests/unit/controllers/profile-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/profile-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/profile-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/controllers/register-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:register", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mowr/tests/unit/controllers/register-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/register-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/register-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/initializers/current-user-test', ['ember', 'mowr/initializers/current-user', 'qunit'], function (Ember, current_user, qunit) {

  'use strict';

  var container, application;

  qunit.module("CurrentUserInitializer", {
    beforeEach: function beforeEach() {
      Ember['default'].run(function () {
        application = Ember['default'].Application.create();
        container = application.__container__;
        application.deferReadiness();
      });
    }
  });

  // Replace this with your real tests.
  qunit.test("it works", function (assert) {
    current_user.initialize(container, application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });

});
define('mowr/tests/unit/initializers/current-user-test.jshint', function () {

  'use strict';

  module('JSHint - unit/initializers');
  test('unit/initializers/current-user-test.js should pass jshint', function() { 
    ok(true, 'unit/initializers/current-user-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/initializers/parse-test', ['ember', 'mowr/initializers/parse', 'qunit'], function (Ember, parse, qunit) {

  'use strict';

  var container, application;

  qunit.module("ParseInitializer", {
    beforeEach: function beforeEach() {
      Ember['default'].run(function () {
        application = Ember['default'].Application.create();
        container = application.__container__;
        application.deferReadiness();
      });
    }
  });

  // Replace this with your real tests.
  qunit.test("it works", function (assert) {
    parse.initialize(container, application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });

});
define('mowr/tests/unit/initializers/parse-test.jshint', function () {

  'use strict';

  module('JSHint - unit/initializers');
  test('unit/initializers/parse-test.js should pass jshint', function() { 
    ok(true, 'unit/initializers/parse-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/models/login-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("login", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mowr/tests/unit/models/login-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/login-test.js should pass jshint', function() { 
    ok(true, 'unit/models/login-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/models/options-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("options", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mowr/tests/unit/models/options-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/options-test.js should pass jshint', function() { 
    ok(true, 'unit/models/options-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/models/register-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("register", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mowr/tests/unit/models/register-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/register-test.js should pass jshint', function() { 
    ok(true, 'unit/models/register-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/models/request-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("request", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mowr/tests/unit/models/request-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/request-test.js should pass jshint', function() { 
    ok(true, 'unit/models/request-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/models/user-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("user", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('mowr/tests/unit/models/user-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/user-test.js should pass jshint', function() { 
    ok(true, 'unit/models/user-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/routes/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:application", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mowr/tests/unit/routes/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/application-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/application-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/routes/completed-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:completed", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mowr/tests/unit/routes/completed-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/completed-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/completed-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/routes/contractor-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:contractor", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mowr/tests/unit/routes/contractor-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/contractor-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/contractor-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/routes/landing-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:landing", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mowr/tests/unit/routes/landing-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/landing-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/landing-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/routes/loading-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:loading", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mowr/tests/unit/routes/loading-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/loading-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/loading-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/routes/login-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:login", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mowr/tests/unit/routes/login-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/login-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/login-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/routes/options-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:options", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mowr/tests/unit/routes/options-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/options-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/options-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/routes/profile-edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:profile-edit", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mowr/tests/unit/routes/profile-edit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/profile-edit-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/profile-edit-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/routes/profile-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:profile", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mowr/tests/unit/routes/profile-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/profile-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/profile-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/routes/register-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:register", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('mowr/tests/unit/routes/register-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/register-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/register-test.js should pass jshint.'); 
  });

});
define('mowr/tests/unit/views/toggle-switch-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("view:toggle-switch");

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var view = this.subject();
    assert.ok(view);
  });

});
define('mowr/tests/unit/views/toggle-switch-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views');
  test('unit/views/toggle-switch-test.js should pass jshint', function() { 
    ok(true, 'unit/views/toggle-switch-test.js should pass jshint.'); 
  });

});
define('mowr/tests/views/toggle-switch.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/toggle-switch.js should pass jshint', function() { 
    ok(true, 'views/toggle-switch.js should pass jshint.'); 
  });

});
define('mowr/views/toggle-switch', function () {

	'use strict';

	// import Ember from 'ember';
	//
	// App.ToggleSwitch = Ember.View.extend({
	//   classNames: ['toggle-switch'],
	//   templateName: 'toggle_switch',
	//
	//   init: function() {
	//     this._super.apply(this, arguments);
	//     return this.on('change', this, this._updateElementValue);
	//   },
	//
	//   checkBoxId: (function() {
	//     return "checker-" + (this.get('elementId'));
	//   }).property(),
	//
	//   _updateElementValue: function() {
	//     return this.set('checked', this.$('input').prop('checked'));
	//   }
	// });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('mowr/config/environment', ['ember'], function(Ember) {
  var prefix = 'mowr';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("mowr/tests/test-helper");
} else {
  require("mowr/app")["default"].create({"name":"mowr","version":"0.0.0.32d8fc80"});
}

/* jshint ignore:end */
//# sourceMappingURL=mowr.map