// Load NPM module mongodb
const mongodb = require('mongodb');

// Connection String to MongoDB
const connectionString = 'mongodb://localhost:27017/people';

var component = {

  // MongoDB client
  client: mongodb.MongoClient,

  // Connection object to the database
  connection: null,

  // Collection object
  collection: null,

  // Setup the connection to the database
  setupConnection: function(callback) {
    // Self reference to the object
    var self = this;

    // Attempt to connect to MongoDB
    console.log('[MongoDB] Trying to connect...');
    this.client.connect(connectionString, function(error, database) {
      if (error) {
        console.error('[MongoDB] Unable to connect to the database.', error.message);
      } else {
        // Connection was successful
        console.log('[MongoDB] Connected successfully!');
      }

      // Assign the current open connection to the object property
      self.connection = database;

      // Assign the selected collection to the object property
      self.collection = database.collection('people');

      // Callback
      if (callback) {
        callback();
      }
    });
  },

  // Insert a single document in the collection
  insertRecord: function(record) {
    try {
      this.collection.insert(record);
    } catch (exception) {
      console.error('[MongoDB] Insert failed:', exception.message);
    }
  },

  // Find and return all documents from the collection
  findAll: function(callback) {
    try {
      this.collection.find({}).toArray(function(error, docs) {
        if (error) {
          console.error('[MongoDB] Find all documents failed.', error.message);
        }
        callback(docs);
      });
    } catch (exception) {
      console.error('[MongoDB] Find all documents failed:', exception.message);
    }
  },

  // Search a document by ID
  findById: function(id, callback, callbackError) {
    try {
      this.collection.find({'_id': id}).toArray(function(error, docs) {
        if (error) {
          console.error('[MongoDB] Find by ID failed.', error.message);
          callbackError();
        }

        // Found any results?
        if (docs.length > 0) {
          callback(docs);
        } else {
          callbackError();
        }
      });
    } catch (exception) {
      console.error('[MongoDB] Find by ID failed:', exception.message);
    }
  }

};

// Export the module
module.exports = component;