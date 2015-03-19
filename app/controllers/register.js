import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    save: function() {
      var self = this;
      var user = this.get('model');
      user.username = user.email;
      this.store.save('register', user).then(function() {
        self.get('session').authenticate('authenticator:parse-email', user);
      });
    }
  }
});
