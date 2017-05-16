FROM node:6.10.3

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

# Starts Node.js application
CMD ["npm", "start"]