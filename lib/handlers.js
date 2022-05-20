/*
* Request Handlers
*
*/

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define the handler
const handlers = {};

// Users
handlers.users = function(data,callback){
  const acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1 ){
    handlers._users[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Conatiner for the users submethods
handlers._users = {};

// Users - post
// REquired data: firstName, lastName, phone, password, tosAggrement
// Optional data: none
handlers._users.post = function(data,callback){
  // Check that all required fields are filled out
  let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  let tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if(firstName && lastName && phone && password && tosAgreement){
    // Make sure that the user doesnt already exist
    _data.read('users',phone,function(err,data){
      if(err){
        // Hash the password
        const hashedPassword = helpers.hash(password);

        // Create user object
        if(hashedPassword){
          const userObject = {
            'firstName' : firstName,
            'lastName' : lastName,
            'phone' : phone,
            'hashedPassword' : hashedPassword,
            'tosAgreement' : true
          };

          // Store the user
          _data.create('users',phone,userObject,function(err){
            if(!err){
              callback(200);
            } else {
              console.log(err);
              callback(500,{'Error':'Could not create the new user'});
            }
          });
        } else {
          callback(500,{'Error':'Could not hash the user\'s password'});
        }
      } else {
        // Users already exist
        callback(400,{'Error':'A user with that phone number already exist'});
      }
    });
  } else {
    callback(400,{'Error': 'Missing required field'});
  }
};

// Users - get
// Required data : phone
// Optional Data : none
// @TODO only let an authonticated user access their object. Don't let them access anyone elses
handlers._users.get = function(data,callback){
  // Check that the phone number is valid
  const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
      _data.read('users',phone,function(err,data){
        if(!err && data){
          // Remove the hashed password from the user object before returning it to the requster
          delete data.hashedPassword;
          callback(200,data);
        } else {
          callback(404);
        }
      });
  } else {
      callback(400,{'Error':'Missing required field'});
  }
};

// Users - put
// Required data : phone
// Optional Data : firstName, lastName, password (at least one must e specified)
// @TODO only let an authenticated user update their own object. Don't let them update anyone elsess.
handlers._users.put = function(data,callback){
// Check for the required field
let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

// Check for the optional field
let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

// Error if the phone is invalid
if(phone){
  if(firstName || lastName || password){
    // Lookup the user
    _data.read('users',phone,function(err,userData){
      if(!err && userData){
        // Update user data
        if(firstName){
          userData.firstName = firstName;
        }
        if(lastName){
          userData.lastName = lastName;
        }
        if(password){
          userData.hashedPassword = helpers.hash(password);
        }
        // Store the new updates
        _data.update('users',phone,userData,function(err){
          if(!err){
            callback(200);
          } else {
            console.log(err);
            callback(500,{'Error':'Could not update the user'});
          }
        })
      } else {
        callback(400,{'Error':'Specified user dose not exist'});
      }
    });
  } else {
    callback(400,{'Error':'Missing field to update'});
  }
} else {
  callback(400,{'Error':'Missing require field'});
}
};

// Users - delete
// Required filed : phone
// @TODO only let authinticated user delete their object. Don't let them delete anyone elses
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = function(data,callback){
  // Check that the phone number is valid
  const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
      // Lookup the user
      _data.read('users',phone,function(err,data){
        if(!err && data){
          _data.delete('users',phone,function(err){
            if(!err){
              callback(200);
            } else {
              callback(500,{'Error' : 'Could not delete the specified user'});
            }
          })
        } else {
          callback(400,{'Error' : 'Could not find specified user'});
        }
      });
  } else {
      callback(400,{'Error':'Missing required field'});
  }
};

// Ping handler
handlers.ping = function(data,callback){
  callback(200);
};

// Not found handler
handlers.notFound = function(data,callback){
  callback(404);
}

// Export the module
module.exports = handlers;
