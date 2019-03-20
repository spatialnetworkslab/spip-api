import knex from 'knex'
import stringify from 'csv-stringify'
import express from 'express'
import * as cache from '../config/cache.js'

// import data structures
import * as persoonsgegevens from '../data-structures/nodes-persoonsgegevens.js'
import * as banenWoon from '../data-structures/nodes-banen-woon.js'
import * as banenWerk from '../data-structures/nodes-banen-werk.js'
import * as persoonsgegevens2015 from '../data-structures/nodes-persoonsgegevens-2015.js'
import * as banenWoon2015 from '../data-structures/nodes-banen-woon-2015.js'
import * as banenWerk2015 from '../data-structures/nodes-banen-werk-2015.js'
import * as banenSBI2015 from '../data-structures/nodes-banen-sbi-2015.js'
import * as squareKilometers from '../data-structures/nodes-square-kms.js'
import * as persoonsgegevens2016 from '../data-structures/nodes-persoonsgegevens-2016.js'
import * as banenWoon2016 from '../data-structures/nodes-banen-woon-2016.js'
import * as banenWerk2016 from '../data-structures/nodes-banen-werk-2016.js'
import * as banenWoonZorg from '../data-structures/nodes-banen-woon-zorg.js'
import * as banenWerkZorg from '../data-structures/nodes-banen-werk-zorg.js'

// make data structures available as object
const structureList = {
  'persoonsgegevens': persoonsgegevens.structure,
  'banen-woon': banenWoon.structure,
  'banen-werk': banenWerk.structure,
  'persoonsgegevens2015': persoonsgegevens2015.structure,
  'banen-woon2015': banenWoon2015.structure,
  'banen-werk2015': banenWerk2015.structure,
  'persoonsgegevens2016': persoonsgegevens2016.structure,
  'banen-woon2016': banenWoon2016.structure,
  'banen-werk2016': banenWerk2016.structure,
  'banen-woonzorg-2': banenWoonZorg.structure,
  'banen-werkzorg': banenWerkZorg.structure,
  'banen-sbi2015': banenSBI2015.structure,
  'nodes-square-kms': squareKilometers.structure
}

// set up database connections
const dbList = {
  'persoonsgegevens': setKnexDb(persoonsgegevens.structure),
  'banen-woon': setKnexDb(banenWoon.structure),
  'banen-werk': setKnexDb(banenWerk.structure),
  'persoonsgegevens2015': setKnexDb(persoonsgegevens2015.structure),
  'banen-woon2015': setKnexDb(banenWoon2015.structure),
  'banen-werk2015': setKnexDb(banenWerk2015.structure),
  'persoonsgegevens2016': setKnexDb(persoonsgegevens2016.structure),
  'banen-woon2016': setKnexDb(banenWoon2016.structure),
  'banen-werk2016': setKnexDb(banenWerk2016.structure),
  'banen-woonzorg-2': setKnexDb(banenWoonZorg.structure),
  'banen-werkzorg': setKnexDb(banenWerkZorg.structure),
  'banen-sbi2015': setKnexDb(banenSBI2015.structure),
  'nodes-square-kms': setKnexDb(squareKilometers.structure)
}

// router
export const router = express.Router()

function isEmptyObject (obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

router.route('/nodes')
  // return list of all available datasets
  .get(function (req, res, next) {
    res.json(structureList)
  })

router.route('/nodes/:shortName')
  // return list of attributes of single dataset
  .get(function (req, res, next) {
    res.json(structureList[req.params.shortName])
  })
  // return data based on query
  // query params are sent in the request body
  .post(cache.leveldbCache, (req, res, next) => {
    res.set('Content-Type', 'text/csv')
    // Change empty objects to null (artefact from json parsing in rserver)
    let reqBody = JSON.parse(JSON.stringify(req.body))
    for (let field in reqBody.fields) {
      if (reqBody.fields[field]) {
        if (isEmptyObject(reqBody.fields[field])) {
          reqBody.fields[field] = null
        }
      }
    }

    // initiate query
    const query = parseDataset(reqBody)
    console.log(query.toString())
    // execute query
    const result = []
    result.push(['id', 'count', 'weight'])
    query.map(function (row) {
      // if data is for multiple years we need to divide the row sum
      const rowSum = Math.round(setRowSums(row.sum, req.body))
      result.push([row.id, row.count, rowSum])
    })
      .then(function (rows) {
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
  const id = structure.spatialUnits[parameters.spatialUnits].id

  // set table
  const query = db.from(structure.spatialUnits[parameters.spatialUnits].table)

  // set where
  const queryWhere = whereKnex(query, parameters.fields, structure)

  // set total if needed
  const queryWhereTotal = (structure.total) ? structure.total(queryWhere, parameters) : queryWhere

  // set select as
  const querySelected = selectKnex(queryWhereTotal, id, structure.count, structure.weight)

  // set group by
  const queryGroupBy = (structure.groupBy) ? querySelected.groupBy(id) : querySelected

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
function selectKnex (query, id, count, weight) {
  return query
    .select([selectAs(id, 'id')])
    .count(selectAs(count, 'count'))
    .sum(selectAs(weight, 'sum'))
}

// create 'WHERE' part of sql query
// look up the field type in the data-structure object (e.g. range, category) and create where syntax accordingly
function whereKnex (query, fields, structure) {
  for (let field in fields) {
    if (fields[field]) {
      switch (structure.fields[field].type) {
        case 'range':
          query = whereRange(query, field, fields[field])
          break
        case 'category':
          query = (structure.fields[field].multiple) ? whereCategoryMultiple(query, field, fields[field]) : whereCategorySingle(query, field, fields[field])
          break
        case 'categoryCode':
          query = whereCategoryMultiple(query, field, fields[field])
          break
        case 'special':
          query = whereSpecial(query, fields[field], structure.fields[field].customLogic)
          break
      }
    } else {
      query = whereNull(query, field)
    }
  }
  return query
}

// set query to null
function whereNull (query, field) {
  return query
    .whereNull(field)
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
  return customlogic(query, value)
}

// helper function that takes uses rowSumCalculation for specific dataset if it exists
function setRowSums (rowSum, parameters) {
  const structure = structureList[parameters.dataset]
  return (structure.rowSumCalculation) ? structure.rowSumCalculation(rowSum, parameters) : rowSum
}

// helper function for knex to select fields 'as' different fieldname
function selectAs (input, output) {
  return input + ' as ' + output
}

function flatten (arr) {
  return Array.prototype.concat(...arr)
}
