import Ember from 'ember';

export default Ember.Controller.extend({

  // names: ["customer", "contractor"],

  actions: {
    save: function() {
      this.get('model').save().then(function(){
        console.log('success');
      });
      this.transitionToRoute('completed');
    }
  }
});
