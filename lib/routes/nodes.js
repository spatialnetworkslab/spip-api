import stringify from 'csv-stringify'
import express from 'express'
import * as cache from '../cache.js'

import { setupDatabases } from './utils/dbutils.js'

export default function nodes (nodeDataSources) {
  const nodeDatabases = setupDatabases(nodeDataSources)

  // router
  const router = express.Router()

  router.route('/nodes')
    // return list of all available datasets
    .get(function (req, res, next) {
      res.json(nodeDataSources)
    })

  router.route('/nodes/:key')
    // return list of attributes of single dataset
    .get(function (req, res, next) {
      res.json(nodeDataSources[req.params.key])
    })
    // return data based on query
    // query params are sent in the request body
    .post(cache.leveldbCache, (req, res, next) => {
      res.set('Content-Type', 'text/csv')
      // Change empty objects to null (artefact from json parsing in rserver)
      const reqBody = JSON.parse(JSON.stringify(req.body))
      for (const field in reqBody.fields) {
        if (reqBody.fields[field]) {
          if (isEmptyObject(reqBody.fields[field])) {
            reqBody.fields[field] = null
          }
        }
      }

      // initiate query
      const query = parseDataset(reqBody, nodeDatabases, nodeDataSources)
      console.log(query.toString())
      // execute query
      const result = []
      result.push(['id', 'count', 'weight'])
      query.map(function (row) {
        // if data is for multiple years we need to divide the row sum
        const rowSum = Math.round(setRowSums(row.sum, req.body, nodeDataSources))
        result.push([row.id, row.count, rowSum])
      })
        .then(function (rows) {
          stringify(result, function (err, output) {
            if (err) throw err
            res.send(output)
          })
        })
    })
}

function isEmptyObject (obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object
}

// parse incoming req parameters based on structure defined in 'data-structures'
// construct Knex query then execute and send csv
function parseDataset (parameters, nodeDatabases, nodeDataSources) {
  const db = nodeDatabases[parameters.dataset]
  const structure = nodeDataSources[parameters.dataset]
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
  for (const field in fields) {
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
function setRowSums (rowSum, parameters, nodeDataSources) {
  const structure = nodeDataSources[parameters.dataset]
  return (structure.rowSumCalculation) ? structure.rowSumCalculation(rowSum, parameters) : rowSum
}

// helper function for knex to select fields 'as' different fieldname
function selectAs (input, output) {
  return input + ' as ' + output
}

function flatten (arr) {
  return Array.prototype.concat(...arr)
}
