import knex from 'knex'
import stringify from 'csv-stringify'
import express from 'express'
import * as cache from '../config/cache.js'

// import data structures
import * as ovin from '../data-structures/edges-ovin20042017.js'
import * as woonwerk from '../data-structures/edges-woonwerk.js'
import * as werkwerk from '../data-structures/edges-werkwerk.js'
import * as migration from '../data-structures/edges-migration.js'
import * as woonwerk2015 from '../data-structures/edges-woonwerk-2015.js'
import * as werkwerk2015 from '../data-structures/edges-werkwerk-2015.js'
import * as migration2015 from '../data-structures/edges-migration-2015.js'
import * as woonwerk2016 from '../data-structures/edges-woonwerk-2016.js'
import * as werkwerk2016 from '../data-structures/edges-werkwerk-2016.js'
import * as migration2016 from '../data-structures/edges-migration-2016.js'
import * as woonwerkzorg from '../data-structures/edges-zorg.js'
import * as edgescvto from '../data-structures/edges-cvto.js'

// make data structures available as object
const structureList = {
  'ovin-2': ovin.structure,
  'woonwerk': woonwerk.structure,
  'werkwerk': werkwerk.structure,
  'migration': migration.structure,
  'woonwerk2015-1': woonwerk2015.structure,
  'werkwerk2015': werkwerk2015.structure,
  'migration2015': migration2015.structure,
  'woonwerk2016': woonwerk2016.structure,
  'woonwerkzorg': woonwerkzorg.structure,
  'werkwerk2016': werkwerk2016.structure,
  'migration2016': migration2016.structure,
  'edges-cvto': edgescvto.structure
}

// set up database connections
const dbList = {
  'ovin-2': setKnexDb(ovin.structure),
  'woonwerk': setKnexDb(woonwerk.structure),
  'werkwerk': setKnexDb(werkwerk.structure),
  'migration': setKnexDb(migration.structure),
  'woonwerk2015-1': setKnexDb(woonwerk2015.structure),
  'werkwerk2015': setKnexDb(werkwerk2015.structure),
  'migration2015': setKnexDb(migration2015.structure),
  'woonwerk2016': setKnexDb(woonwerk2016.structure),
  'woonwerkzorg': setKnexDb(woonwerkzorg.structure),
  'werkwerk2016': setKnexDb(werkwerk2016.structure),
  'migration2016': setKnexDb(migration2016.structure),
  'edges-cvto': setKnexDb(edgescvto.structure)
}

// router
export const router = express.Router()

router.route('/edges')
  // return list of all available datasets and metadata
  .get(function (req, res, next) {
    res.json(structureList)
  })

router.route('/edges/:shortName')
  // return list of attributes of single dataset
  .get(function (req, res, next) {
    res.json(structureList[req.params.shortName])
  })
  // return data based on query
  // query params are sent in the request body
  .post(cache.leveldbCache, (req, res, next) => {
    res.set('Content-Type', 'text/csv')
    // initiate query
    const query = parseDataset(req.body)
    console.log(query.toString())
    // execute query
    const result = []
    result.push(['source', 'sink', 'count', 'weight'])
    query.map(function (row) {
      // if data is for multiple years we need to divide the row sum
      const rowSum = Math.round(setRowSums(row.sum, req.body))
      result.push([row.source, row.sink, row.count, rowSum])
    })
      .then(function (rows) {
        // stringify array to csv
        stringify(result, function (err, output) {
          if (err) throw err
          res.send(output)
        })
      })
  })

// parse incoming req parameters based on structure defined in 'data-structures'
// construct Knex query then execute and send csv
function parseDataset (parameters) {
  const db = dbList[parameters.dataset]
  const structure = structureList[parameters.dataset]
  const source = structure.spatialUnits[parameters.spatialUnits].sourceName
  const sink = structure.spatialUnits[parameters.spatialUnits].sinkName

  // set table
  const query = db.from(structure.spatialUnits[parameters.spatialUnits].table)

  // set where
  const queryWhere = whereKnex(query, parameters.fields, structure)

  // set total if needed
  const queryWhereTotal = (structure.total) ? structure.total(queryWhere, parameters) : queryWhere

  // set select as
  const querySelected = selectKnex(queryWhereTotal, source, sink, structure.count, structure.weight, structure.countType)

  // set group by
  const queryGroupBy = (structure.groupBy) ? querySelected.groupBy(source, sink) : querySelected

  return queryGroupBy
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

// create 'SELECT x as y' part of sql query
function selectKnex (query, source, sink, count, weight, countType) {
  let select = query
    .select([selectAs(source, 'source'), selectAs(sink, 'sink')])
    .sum(selectAs(weight, 'sum'))
  if (countType === 'rowIsIndividual') {
    return select.count(selectAs(count, 'count'))
  } else {
    return select.sum(selectAs(count, 'count'))
  }
}

// create 'WHERE' part of sql query
// look up the field type in the data-structure object (e.g. range, category) and create where syntax accordingly
function isEmptyObject (obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

function whereKnex (query, fields, structure) {
  for (let field in fields) {
    if (fields[field] && !isEmptyObject(fields[field])) {
      switch (structure.fields[field].type) {
        case 'range':
          query = whereRange(query, field, fields[field])
          break
        case 'category':
          query = (structure.fields[field].multiple) ? whereCategoryMultiple(query, field, fields[field]) : whereCategorySingle(query, field, fields[field])
          break
        case 'special':
          query = whereSpecial(query, fields[field], structure.fields[field].customLogic)
          break
      }
    } else {
      if (structure.hasNulls === true) query = whereNull(query, field, structure.fields[field].type)
    }
  }
  return query
}

// set query to null
function whereNull (query, field, type) {
  if (type !== 'special') {
    return query
      .whereNull(field)
  } else {
    return query
  }
}

// range query (e.g. year, age)
function whereRange (query, field, values) {
  return query
    .whereBetween(field, values)
}

// category where multiple values can be selected (checkbox in UI)
function whereCategoryMultiple (query, field, values) {
  return query
    .whereIn(field, flatten([values]))
}

// category where only a single value can be selected (radio button in UI)
function whereCategorySingle (query, field, value) {
  return query
    .where(field, value)
}

// special category where custom logic is included as function (e.g. hhfilter)
function whereSpecial (query, value, customlogic) {
  return customlogic(query, value.toString())
}

// helper function that takes uses rowSumCalculation for specific dataset if it exists
function setRowSums (rowSum, parameters) {
  const structure = structureList[parameters.dataset]
  return (structure.rowSumCalculation) ? structure.rowSumCalculation(rowSum, parameters, structure) : rowSum
}

// helper function for knex to select fields 'as' different fieldname
function selectAs (input, output) {
  return input + ' as ' + output
}

function flatten (arr) {
  return Array.prototype.concat(...arr)
}
