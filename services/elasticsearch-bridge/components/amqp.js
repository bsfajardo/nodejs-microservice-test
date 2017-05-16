// Load NPM module amqplib
const amqp = require('amqplib/callback_api');

// Connection String for the Message Broker
const connectionString = 'amqp://message_queue';

var component = {

  // Connection object to the Message Broker
  connection: null,

  // Channel object to the Message Broker
  channel: null,

  // Setup the connection to the Message Broker and makes sure everything is ready
  setupConnection: function(callback) {
    // Self reference to the object
    var self = this;

    // Attempt to create a RabbitMQ client and connect to the Broker
    console.log('[AMQP] Trying to connect...');
    amqp.connect(connectionString, function(error, connection) {
      if (error) {
        console.error('[AMQP] Server is not responding.', error.message);
        // Connection not active yet, retry in 3 seconds
        return setTimeout(function() {
          self.setupConnection(callback);
        }, 3000);
      } else {
        // Connection was successful
        console.log('[AMQP] Connected successfully!');

        // Connection error event
        connection.on('error', function(error) {
          if (error.message !== 'Connection closing') {
            console.error('[AMQP] Connection error:', error.message);
          }
        });

        // Connection close event
        connection.on('close', function() {
          console.error('[AMQP] Reconnecting...');
          // Closed connection, retry in 3 seconds
          return setTimeout(function() {
            self.setupConnection(callback);
          }, 3000);
        });

        // Assign the current open connection to the object property
        self.connection = connection;

        // Setup the channel
        self.setupChannel(callback);
      }
    });
  },

  // Setup the channel to the Broker
  setupChannel: function(callback) {
    // Self reference to the object
    var self = this;

    this.connection.createChannel(function(error, channel) {
      // Close connection on error
      if (self.closeOnError(error)) {
        return;
      }

      // Channel open was successful
      console.log('[AMQP] Channel opened successfully!');

      // Channel error event
      channel.on('error', function(error) {
        console.error('[AMQP] Channel error:', error.message);
        // Channel not active yet, retry in 3 seconds
        return setTimeout(function() {
          self.setupChannel(callback);
        }, 3000);
      });

      // Channel close event
      channel.on('close', function() {
        console.error('[AMQP] Reopening channel...');
        // Closed channel, retry in 3 seconds
        return setTimeout(function() {
          self.setupChannel(callback);
        }, 3000);
      });

      // Assign the current open channel to the object property
      self.channel = channel;

      // Callback
      if (callback) {
        callback();
      }
    });
  },

  // Try to consume messages from the Broker
  processQueue: function(callback) {
    // Self reference to the object
    var self = this;

    // Make sure the channel is open
    if (!this.channel) {
      console.error('[AMQP] Channel down.');
      return;
    }

    // Prefetch 10 messages
    this.channel.prefetch(10);

    // Check existence of queue and fetch messages
    this.channel.assertQueue('people', { durable: true }, function(error, success) {
      // Close connection on error
      if (self.closeOnError(error)) {
        return;
      }

      // Consume messages from the queue and pass them to the callback
      console.log('[AMQP] Consuming messages from queue "people".');
      self.channel.consume('people', callback, { noAck: false });
    });
  },

  // Close the connection on error
  closeOnError: function(error) {
    if (!error) {
      return false;
    }
    console.error('[AMQP] Error:', error);
    this.connection.close();
    return true;
  },

  // Acknowledge message in the Broker
  ackMessage: function(message) {
    try {
      this.channel.ack(message);
    } catch (exception) {
      console.error('[AMQP] Exception trying to ack message:', exception.message);
    }
  },

  // Reject message in the Broker
  rejectMessage: function(message) {
    try {
      this.channel.reject(message, true);
    } catch (exception) {
      console.error('[AMQP] Exception trying to reject message:', exception.message);
    }
  }

};

// Export the module
module.exports = component;