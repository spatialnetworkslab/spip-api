import stringify from 'csv-stringify'
import express from 'express'
import * as cache from '../cache.js'

import { setupDatabases } from './utils/dbutils.js'

export default function edges (edgeDataSources) {
  const edgeDatabases = setupDatabases(edgeDataSources)

  // router
  const router = express.Router()

  router.route('/edges')
    // return list of all available datasets and metadata
    .get(function (req, res, next) {
      res.json(edgeDataSources)
    })

  router.route('/edges/:key')
    // return list of attributes of single dataset
    .get(function (req, res, next) {
      res.json(edgeDataSources[req.params.key])
    })
    // return data based on query
    // query params are sent in the request body
    .post(cache.leveldbCache, (req, res, next) => {
      res.set('Content-Type', 'text/csv')
      // initiate query
      const query = parseDataset(req.body, edgeDatabases, edgeDataSources)
      console.log(query.toString())
      // execute query
      const result = []
      result.push(['source', 'sink', 'count', 'weight'])
      query.map(function (row) {
        // if data is for multiple years we need to divide the row sum
        const rowSum = Math.round(setRowSums(row.sum, req.body, edgeDataSources))
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

  return router
}

function parseDataset (parameters, edgeDatabases, edgeDataSources) {
  const db = edgeDatabases[parameters.dataset]
  const structure = edgeDataSources[parameters.dataset]
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

// create 'SELECT x as y' part of sql query
function selectKnex (query, source, sink, count, weight, countType) {
  const select = query
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
  for (const field in fields) {
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
function setRowSums (rowSum, parameters, edgeDataSources) {
  const structure = edgeDataSources[parameters.dataset]
  return (structure.rowSumCalculation) ? structure.rowSumCalculation(rowSum, parameters, structure) : rowSum
}

// helper function for knex to select fields 'as' different fieldname
function selectAs (input, output) {
  return input + ' as ' + output
}

function flatten (arr) {
  return Array.prototype.concat(...arr)
}
