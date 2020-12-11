FROM node:14.15.0-alpine3.12
WORKDIR /spip-api
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3002
CMD ["node", "-r", "esm" , "./server.js"]
