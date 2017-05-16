FROM node:6.10.3

# Installation

# Import MongoDB public GPG key, update apt-get sources and create a MongoDB list file
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
RUN apt-get update
RUN apt-get install -y --no-install-recommends software-properties-common
RUN echo "deb http://repo.mongodb.org/apt/ubuntu $(cat /etc/lsb-release | grep DISTRIB_CODENAME | cut -d= -f2)/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list

# Install MongoDB
RUN apt-get install -y mongodb

# Create the MongoDB data directory
RUN mkdir -p /data/db

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Expose port from the container to the host
EXPOSE 8080

# Starts MongoDB and Node.js app
CMD ./scripts/start.sh