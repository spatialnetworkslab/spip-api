FROM node:14.15.0-alpine3.12

# Install node dependencies
WORKDIR /spip-api
COPY package*.json ./
RUN npm install

# Copy code
COPY src ./src
COPY server.js ./

# Run server
EXPOSE 3002
CMD ["node", "-r", "esm" , "./server.js"]
