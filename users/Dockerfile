# users/Dockerfile
# Builds the users microservice image. Context = ./users

FROM mhart/alpine-node:7.10.1

# Base directory inside the container
WORKDIR /srv

# Install dependencies
ADD package.json ./
RUN npm install

# Copy the rest of the users service code (server.js, db.json, etc.)
ADD . .

# Koa app listens on 3000
EXPOSE 3000

# Run the users app
CMD ["node", "server.js"]
