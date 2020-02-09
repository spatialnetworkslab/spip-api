import stringify from 'csv-stringify'
import express from 'express'
import * as cache from '../cache.js'

import { setupDatabases } from './utils/dbutils.js'
import { isEmptyObject, selectAs, flatten } from './utils/utils.js'

export default function nodes (nodeDatasetDescriptions) {
  const nodeDatabases = setupDatabases(nodeDatasetDescriptions)

  // router
  const router = express.Router()

  router.route('/nodes')
    // return list of all available datasets
    .get(function (req, res, next) {
      res.json(nodeDatasetDescriptions)
    })

  router.route('/nodes/:datasetKey')
    // return list of attributes of single dataset
    .get(function (req, res, next) {
      res.json(nodeDatasetDescriptions[req.params.datasetKey])
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
      const query = parseDataset(reqBody, nodeDatabases, nodeDatasetDescriptions)
      console.log(query.toString())
      // execute query
      const result = []
      result.push(['id', 'count', 'weight'])
      query.map(function (row) {
        // if data is for multiple years we need to divide the row sum
        const rowSum = Math.round(setRowSums(row.sum, req.body, nodeDatasetDescriptions))
        result.push([row.id, row.count, rowSum])
      })
        .then(function (rows) {
          stringify(result, function (err, output) {
            if (err) throw err
            res.send(output)
          })
        })
    })

  return router
}

// parse incoming req parameters based on structure defined in 'dataset-descriptions'
// construct Knex query then execute and send csv
function parseDataset (parameters, nodeDatabases, nodeDatasetDescriptions) {
  const db = nodeDatabases[parameters.datasetKey]
  const datasetDescription = nodeDatasetDescriptions[parameters.datasetKey]
  const id = datasetDescription.spatialUnits[parameters.spatialUnits].id

  // set table
  const query = db.from(datasetDescription.spatialUnits[parameters.spatialUnits].table)

  // set where
  const queryWhere = whereKnex(query, parameters.fields, datasetDescription)

  // set total if needed
  const queryWhereTotal = (datasetDescription.total)
    ? datasetDescription.total(queryWhere, parameters)
    : queryWhere

  // set select as
  const querySelected = selectKnex(
    queryWhereTotal, id, datasetDescription.count, datasetDescription.weight
  )

  // set group by
  const queryGroupBy = (datasetDescription.groupBy)
    ? querySelected.groupBy(id)
    : querySelected

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
function whereKnex (query, fields, datasetDescription) {
  for (const field in fields) {
    if (fields[field]) {
      switch (datasetDescription.fields[field].type) {
        case 'range':
          query = whereRange(query, field, fields[field])
          break
        case 'category':
          query = (datasetDescription.fields[field].multiple)
            ? whereCategoryMultiple(query, field, fields[field])
            : whereCategorySingle(query, field, fields[field])
          break
        case 'categoryCode':
          query = whereCategoryMultiple(query, field, fields[field])
          break
        case 'special':
          query = whereSpecial(query, fields[field], datasetDescription.fields[field].customLogic)
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
function setRowSums (rowSum, parameters, nodeDatasetDescriptions) {
  const datasetDescription = nodeDatasetDescriptions[parameters.datasetKey]
  return (datasetDescription.rowSumCalculation)
    ? datasetDescription.rowSumCalculation(rowSum, parameters)
    : rowSum
}
