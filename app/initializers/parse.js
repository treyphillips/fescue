import Ember from 'ember';

export function initialize(/*container, application*/) {
  Ember.$.ajaxSetup ({
     headers: {
       "X-Parse-Application-Id": 'p47KFGIep1RlVyhaFepbpB3ScSbrAbv6W1qFIjXV',
       "X-Parse-REST-API-Key": 'ECB10wqwm1k2VYkZKWOpTPfIHMjaGczRV96umuRK'
     }
});
}

export default {
  name: 'parse-tokens',
  initialize: initialize
};
