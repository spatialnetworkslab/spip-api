import knex from 'knex'

export function setupEdgeDatabases (edgeDataSources) {
  const edgeDatabases = {}

  for (const key in edgeDataSources) {
    edgeDatabases[key] = setKnexDb(edgeDataSources[key])
  }

  return edgeDatabases
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