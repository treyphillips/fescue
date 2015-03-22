import Ember from 'ember';

	export default Ember.Controller.extend({
	  actions: {
    saveProfile: function(){
      this.get('session.currentUser').save();
      this.transitionToRoute('profile');
    }
	  }
	});
