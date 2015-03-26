import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function(){
    if(this.get('session.currentUser.custOrcont') === "Contractor"){
      this.transitionTo('contractor');
    }
  },

  model: function() {
    return this.store.createRecord('request', {
      createdBy: this.get('session.currentUser')
    });
  },
});
