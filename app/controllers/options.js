import Ember from 'ember';

export default Ember.Controller.extend({

  // names: ["customer", "contractor"],

  actions: {
    save: function() {
      console.log(this.session.currentUser);

      this.store.save('register', this.session.currentUser);
    }
  }
});
