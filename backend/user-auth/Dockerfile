# Base image
FROM node:20.13.1-alpine AS build

# Create app directory
WORKDIR /usr/src

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Copy the .env and .env.development files
# COPY .env .env.development ./

# Creates a "dist" folder with the production build
RUN npm run build:user-auth

# Production
FROM node:20.13.1-alpine

# Create app directory
WORKDIR /app

COPY --from=build /usr/src/dist ./dist

COPY package*.json ./

RUN npm install --only=production

RUN rm package*.json 

# copy abi 
COPY /shared/eth-utilites/src/contract/artifacts/contracts/ChaiContract.sol /app/abi


# Expose the port on which the app will run
EXPOSE 5002

# Start the server using the production build
CMD [ "node","dist/user-auth/main.js" ]


