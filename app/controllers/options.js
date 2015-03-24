import Ember from 'ember';

export default Ember.Controller.extend({

  // names: ["customer", "contractor"],

  actions: {
    save: function() {
      this.get('model').save().then(function(){
        console.log("Youre amazing!!!!");
      });

      this.transitionToRoute('loading');
      Ember.run.later(this, function(){
        this.transitionToRoute('completed');
      }, 3000);

    }
  }
});
