import knex from 'knex'

export function setupDatabases (datasetDescriptions) {
  const databases = {}

  for (const datasetKey in datasetDescriptions) {
    databases[datasetKey] = setKnexDb(datasetDescriptions[datasetKey])
  }

  return databases
}

// create an instance of Knex with db connection for specific data structure
function setKnexDb (structure) {
  const db = knex({
    client: 'sqlite3',
    connection: {
      filename: structure.db
    },
    useNullAsDefault: true
  })
  return db
}
