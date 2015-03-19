import Ember from 'ember';

export default Ember.Object.extend({
  destroy: function(){
    this.store.destroy('User', this);
  },

  save: function(){
    this.store.save('User', this);
  },

  toJSON: function(){
    return this;
  }
});
