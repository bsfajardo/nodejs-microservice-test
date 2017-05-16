// Load components
var amqp = require('./components/amqp');
var elasticsearch = require('./components/elasticsearch');

// Setup ElasticSearch
elasticsearch.setupConnection(function() {
  // Setup RabbitMQ and start consuming the queue
  amqp.setupConnection(consumeQueue);
});

// Consume the queue
var consumeQueue = function() {
  // For each message consumed from the queue, index it on ElasticSearch
  amqp.processQueue(function(message) {
    console.log('Indexing document:', message);
    elasticsearch.indexDocument(message, function(status) {
      if (status) {
        // If document was indexed successfull, acknowledge to the Broker
        amqp.ackMessage(message);
      } else {
        // If an error ocurred while adding the document to the index, reject the message in the Broker
        amqp.rejectMessage(message);
      }
    });
  });
};