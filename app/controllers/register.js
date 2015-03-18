import Ember from 'ember';

export default Ember.Controller.extend({
  model: function() {
    return{};
  },

  actions: {
    save: function() {
      var self = this;
      this.store.save('register', this.modelFor('new')).then(function(){
        self.transitionTo('options');
      });
    }
  }
});
