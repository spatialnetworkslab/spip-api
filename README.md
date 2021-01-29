# spip-api

Node backend for `spip`.

- Main repo at https://gitlab.kuleuven.be/spatial-networks-lab/spip-api
- Mirror at https://github.com/spatialnetworkslab/spip-api

## Instructions

```js
// We only need to run npm install for eslint
npm install

// Build docker image
npm run build

// Run development stack
npm run dev

// Run test stack
npm run test
```

## Docker notes

```
# build container
docker build --tag spip-api .

# run container, with custom port and config volume mount
# note that the container will only run if Mongo/R services are running as well
docker run -e PORT=3006 -v $(pwd)/config:/spip-api/config spip-api
```