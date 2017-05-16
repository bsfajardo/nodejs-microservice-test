// Load NPM module mongodb
const jsonschema = require('jsonschema');

// Define the schema for the resource People
var peopleSchema = {
  id: '/People',
  type: 'object',
  properties: {
    guid: { type: 'string' },
    isActive: { type: 'boolean' },
    balance: { type: 'string' },
    picture: { type: 'string' },
    age: { type: 'integer' },
    eyeColor: { type: 'string' },
    name: { type: 'string' },
    gender: { type: 'string' },
    company: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    address: { type: 'string' },
    about: { type: 'string' },
    registered: { type: 'string' },
    latitude: { type: 'number' },
    longitude: { type: 'number' },
    tags: {
      type: 'array',
      items: { type: 'string' }
    }
  }
};

var component = {

  validatePeople: function(json) {
    // JSON validator
    var Validator = jsonschema.Validator;
    var peopleValidator = new Validator();

    // Validates JSON against Schema and return the result
    return peopleValidator.validate(json, peopleSchema);
  }

};

// Export the module
module.exports = component;