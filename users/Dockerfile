# users/Dockerfile
# Build an image that contains users/, threads/, and posts/ exactly
# like your repo structure.

FROM mhart/alpine-node:7.10.1

# Base directory inside the container
WORKDIR /srv

# Copy ONLY what we need from the repo root into the image
# (this matches your tree: users/, posts/, threads/)
ADD users   ./users
ADD posts   ./posts
ADD threads ./threads

# Go into users folder to install dependencies
WORKDIR /srv/users
RUN npm install

# Koa app listens on 3000
EXPOSE 3000

# IMPORTANT: run the users app directly from /srv/users
CMD ["node", "server.js"]
