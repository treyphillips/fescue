import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('register');
  this.route('login');
  this.route('options');
  this.route('landing', { path: '/'});
  this.route('completed');
  this.route('profile');
  this.route('profile-edit');
  this.route('loading');
});

export default Router;
