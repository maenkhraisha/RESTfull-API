/*
*create and export configration variables
*
*/

//container for all the environments
var environments = {};

// staging (defualt) environments
environments.staging = {
  'port' : 3000,
  'envName' : 'staging'
};

// staging (defualt) environments
environments.production = {
  'port' : 5000,
  'envName' : 'production'
};

// determine which environment was passed as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// check that the current environment above, if not, default to staging
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//export the module
module.exports = environmentToExport;
