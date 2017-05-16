// Load NPM module elasticsearch
const elasticsearch = require('elasticsearch');

// Hostname and Port for the ElasticSearch cluster
const hostname = 'elasticsearch';
const port = 9200;

var component = {

  // Client object for the cluster
  client: null,

  // Setup the connection to the cluster and makes sure everything is ready
  setupConnection: function(callback) {
    // Self reference to the object
    var self = this;

    // Attempt to create an ElasticSearch client and connect to our cluster
    console.log('[ElasticSearch] Trying to connect...');
    this.client = new elasticsearch.Client({
      host: `${hostname}:${port}`
    });

    // Ping the server to check it's alive
    this.client.ping(
      {
        requestTimeout: 3000
      },
      function (error) {
        if (error) {
          console.error('[ElasticSearch] Cluster is not responding.', error);
          // Connection not active yet, retry in 10 seconds
          return setTimeout(function() {
            self.setupConnection(callback);
          }, 10000);
        } else {
          // Connection was successful
          console.log('[ElasticSearch] Connected successfully!');

          // Setup the cluster (index)
          self.setupCluster();

          // Callback
          if (callback) {
            callback();
          }
        }
      }
    );
  },

  // Setup the cluster (creates the index)
  setupCluster: function() {
    // Self reference to the object
    var self = this;

    // Check if index already exists
    this.client.indices.exists(
      {
        index: 'people'
      },
      function(error, response, status) {
        if (error) {
          console.error('[ElasticSearch] Failed to check index existence:', error);
        } else if (!response) {
          // Create the index
          self.client.indices.create(
            {
              index: 'people',
            },
            function(error, response, status) {
              if (error) {
                console.error('[ElasticSearch] Failed to create index:', error);
              } else {
                console.log('[ElasticSearch] Index created successfully!');
              }
            }
          );
        }
      }
    );
  },

  // Adds a document in the ElasticSearch index
  indexDocument: function(documentBody, callback) {
    // Attempt to add a document to the index
    this.client.index(
      {
        index: 'people',
        type: 'person',
        body: documentBody
      },
      function (error, response) {
        if (error) {
          console.error('[ElasticSearch] Failed to index document:', error);
          callback(false);
        } else {
          console.log('[ElasticSearch] Document indexed successfully!');
          callback(true);
        }
      }
    );
  }

};

// Export the module
module.exports = component;