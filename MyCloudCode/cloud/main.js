var Mandrill = require('mandrill');

function sendTemplate(templateName, params) {
  var promise = new Parse.Promise();

  Mandrill.initialize('Mx2WvDNwdDYIcYarJIxtPg');
  Mandrill.sendTemplate({
    template_name: templateName,
    global_merge_vars: [
      {
        name: "SUBJECT",
        content: params.subject
      },
      {
        name: "FName",
        content: params.firstName
      },
      {
        name: "LName",
        content: params.lastName
      }
    ],
    template_content: [],
    message: {
      from_email: "grassy.app@gmail.com",
      to: [{
        email: params.toEmail,
        name: params.firstName + " " + params.lastName
      }]
    }
  }, {
    success: function (httpResponse) {
      console.log(httpResponse);
      promise.resolve("Email sent!");
    },
    error: function (httpResponse) {
      console.error(httpResponse);
      promise.reject("Uh oh, something went wrong");
    }
  });

  return promise;
}

Parse.Cloud.afterSave('Request', function(request) {
  if(request.object.existed() === false) {
    request.object.get('createdBy').fetch().then(function(user){
      sendTemplate('customer-job-scheduled', {
        subject: 'Fescue to the Rescue',
        firstName: user.get('firstName'),
        lastName: user.get('lastName'),
        toEmail: user.get('email')
      });
    });
  }
});
