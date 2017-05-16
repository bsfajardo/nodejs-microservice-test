// Load modules
const express = require('express');
const bodyParser = require('body-parser');

// Load components
var amqp = require('./components/amqp');
var mongodb = require('./components/mongodb');
var json = require('./components/json');

// Port for HTTP server
const port = 8080;

// Express.js app initialization and configuration
var app = express();
app.use(bodyParser.json());

// Setup MongoDB connection
mongodb.setupConnection(function() {
  // Setup RabbitMQ and start the server
  amqp.setupConnection(startServer);
});

// Start HTTP server
var startServer = function() {
  app.listen(port, function() {
    console.log(`[Node] Express is listening on port ${port}...`);
  });
}

// POST /people
app.post('/people', function(request, response, next) {
  // Receives one person (object) or a list (array) of people
  var jsonData = request.body;

  // If input is an array
  if (Array.isArray(jsonData)) {
    // Validate all objects
    var validInput = 0;
    var invalidInput = 0;
    for (var i in jsonData) {
      if (json.validatePeople(jsonData[i])) {
        validInput++;
      } else {
        invalidInput++;
      }
    }

    // If any object is invalid
    if (invalidInput > 0) {
      // 400 Bad Request
      response.statusCode = 400;
      response.send(JSON.stringify({ validInput: validInput, invalidInput: invalidInput }));
      console.error('[Node][400] POST /people');
      return;
    } else {
      for (var i in jsonData) {
        // Insert data into MongoDB
        mongodb.insertRecord(jsonData[i]);

        // Push message to queue
        amqp.publishQueue('people', new Buffer(JSON.stringify(jsonData[i])));
      }

      // 200 Ok
      response.statusCode = 200;
      response.send('Success: ' + jsonData);
      console.log('[Node][200] POST /people');
      return;
    }
  } else if (typeof jsonData == 'object') {
    // If input is an object
    if (!json.validatePeople(jsonData)) {
      // 400 Bad Request
      response.statusCode = 400;
      response.send('Bad Request: ' + jsonData);
      console.error('[Node][400] POST /people');
      return;
    } else {
      // Insert data into MongoDB
      mongodb.insertRecord(jsonData);

      // Push message to queue
      amqp.publishQueue('people', new Buffer(JSON.stringify(jsonData)));

      // 200 Ok
      response.statusCode = 200;
      response.send('Success: ' + jsonData);
      console.log('[Node][200] POST /people');
      return;
    }
  }

  // 500 Internal Error
  response.statusCode = 500;
  response.send('Internal Error');
  console.error('[Node][500] POST /people');
  return;
});

// GET /people
app.get('/people', function(request, response, next) {
  // get all the records in MongoDB
  mongodb.findAll(function(documents) {
    // 200 Ok
    response.statusCode = 200;
    response.send(documents);
    console.log('[Node][200] GET /people');
    return;
  });

  // 500 Internal Error
  response.statusCode = 500;
  response.send('Internal Error');
  console.error('[Node][500] GET /people');
  return;
});

// GET /people/:id
app.get('/people/:id', function(request, response, next) {
  // ID parameter from the URL
  var id = request.params.id;

  // search by ID in MongoDB
  mongodb.findById(
    id,
    function(documents) {
      // 200 Ok
      response.statusCode = 200;
      response.send(documents);
      console.log('[Node][200] GET /people/:id');
      return;
    },
    function() {
      // 404 Not Found
      response.statusCode = 404;
      response.send('Not Found');
      console.log('[Node][404] GET /people/:id');
      return;
    }
  );

  // 500 Internal Error
  response.statusCode = 500;
  response.send('Internal Error');
  console.error('[Node][500] GET /people/:id');
  return;
});