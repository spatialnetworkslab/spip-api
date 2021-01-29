FROM node:14.15.0-alpine3.12

ENV PORT 3002
ENV HOST_R localhost:3005
ENV HOST_MONGO localhost:27017
ENV CONFIGPATH './config/config.js'
ENV MONGO_DB spip

# Install node dependencies
WORKDIR /spip-api
COPY package*.json ./
RUN npm install

# Copy code
COPY src ./src
COPY server.js ./

# Run server
EXPOSE ${PORT}
CMD ["node", "--unhandled-rejections=strict", "-r", "esm" , "./server.js"]