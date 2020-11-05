FROM node:14.15.0-alpine3.12
WORKDIR /usr/src/spip-api
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3002
CMD ["node", "-r", "esm" , "./server.js"]
