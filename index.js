/*
* This applicaton test the opration of API
* primary file for API
* author : maen al-khraisha
* date : 11/5/2022
*/

//dependencies
const http = require('http');
const https = require('https');
const URL = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config.js');
const fs = require('fs');

// instantiate the HTTP server
const httpServer = http.createServer(function(req,res){
  unifiedServer(req,res);
});

// instantiate the HTTP server
const httpsSErverOptions =  {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem'),
};
const httpsServer = https.createServer(httpsSErverOptions,function(req,res){
  unifiedServer(req,res);
});

// start the server
httpServer.listen(config.httpPort,function(){
  console.log('The server is listeing on port '+config.httpPort);
});

// start the server
httpsServer.listen(config.httpsPort,function(){
  console.log('The server is listeing on port '+config.httpsPort);
});

// all the server logic for both the htpp and https createServer
const unifiedServer = function(req,res){
  // get the url and parse it
  const parsedUrl = URL.parse(req.url,true);

  //get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g,'')

  //get the query string
  const queryStringObject = parsedUrl.query;

  //get the HTTP method
  const method = req.method.toLowerCase();

  //get the header as an object
  const headers = req.headers;

  //get payload if any
  const decoder = new StringDecoder('utf8');
  let buffer = '';
  req.on('data',function(data){
    buffer += decoder.write(data);
  });
  req.on('end',function(){
    buffer += decoder.end();

    //choose the handler this request should go to.
    //if one is not found, use the notFound handler
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    //construct the data object to send to the hamdler
    const data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'headers' : headers,
      'payload' : buffer
    };

    //router the request to the handler specified in the router
    chosenHandler(data,function(statusCode,payload){
      //use the status code call back by the handler or, default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      //use the payload call back by the handler, or defualt to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      //convert the payload to a string
      const payloadString = JSON.stringify(payload);

      //return the response
      res.setHeader('Content-Type','application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      //log the request path
      console.log('Returning this response :',statusCode,payloadString);

    });
  });
}

//define handler
const handlers = {};

//ping handler
handlers.ping = function(data,callback){
  callback(200);
};

//not found handler
handlers.notFound = function(data,callback){
  callback(404);
}

//define a request router
const router = {
  'ping' : handlers.ping
};
