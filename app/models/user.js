import ajax from 'ic-ajax';
import Ember from 'ember';

export default Ember.Object.extend({
  destroy: function(){
    return this.store.destroy('user', this);
  },

  save: function(){
    return this.store.save('user', this);
  },

  toJSON: function(){
    console.log('User#toJSON');
    return this;
  },

  addFavorite: function(bookmark) {
    return ajax("https://api.parse.com/1/users/" + this.id, {
      type: "PUT",
      data: JSON.stringify({
        favorites: {
          __op: "AddRelation",
          objects: [
            {
              __type: 'Pointer',
              className: 'user',
              objectId: bookmark.id
            }
          ]
        }
      })
    });
  }
});
