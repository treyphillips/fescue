import Ember from 'ember';

export function initialize(/*container, application*/) {
  Ember.$.ajaxSetup ({
     headers: {
       "X-Parse-Application-Id": 'jK17LLCxH4HGy3CpsQbFD23nPzJLRbPuU2GgGqL0',
       "X-Parse-REST-API-Key": 'nN6BtUGjJHnSeAFwcGgTj0oWP9WS063ArYojwm2q'
     }
});
}

export default {
  name: 'parse-tokens',
  initialize: initialize
};
