FROM node:14.15.0-alpine3.12
WORKDIR /spip-api
COPY package*.json ./
COPY src ./src
COPY server.js ./
RUN npm install
EXPOSE 3002
CMD ["node", "-r", "esm" , "./server.js"]
