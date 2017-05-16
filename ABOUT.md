# NodeJS microservices Proof-Of-Concept (PoC)

## Instructions

```
docker-compose up
```

Wait for a few seconds until all containers are up and running. Usually
ElasticSearch is the one that that takes longer to start. After all containers
are ready the main Node.js app will be listening on port 8080.

## Microservices Architecture

Here is a high-level overview of the architecture proposed:

+ **services/people**: Node.js application (REST API) to handle user interaction
and MongoDB database to store information. Also interacts with the RabbitMQ
queue service as the publisher.
+ **services/message-queue**: RabbitMQ instance to handle data transfer
between the People microservice (MongoDB) and ElasticSearch cluster.
+ **services/elasticsearch**: ElasticSearch cluster to store and index all data
from the People service to provide search functionality through a REST API.
+ **services/elasticsearch-bridge**: Node.js application acting as a bridge
between RabbitMQ and ElasticSearch. The application will consume the message
broker queue and index any incoming messages in the ElasticSearch index.

No authentication is needed in any microservice since it was not one of the
requirements.