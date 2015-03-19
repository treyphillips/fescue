import Ember from 'ember';
import ajax from 'ic-ajax';


export default Ember.Route.extend({
  model: function() {
    return {};
  },

actions: {
  createToken: function(user) {
    var data = {
      name: user.name,
      pledge: Number(user.pledge),
};
  var self = this;
  ajax("https://api.parse.com/1/classes/user/", {
    type: "POST",
    data: JSON.stringify(data)
  }).then(function(response){
        console.log("Success", response);
        self.transitionToRoute('options');
  });

}
}
});
