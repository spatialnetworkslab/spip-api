import express from 'express'
import * as cache from '../cache.js'

import { setupDatabases } from './utils/dbutils.js'
import { isEmptyObject, selectAs, flatten } from './utils/utils.js'

export default function edges (edgeDatasetDescriptions) {
  const edgeDatabases = setupDatabases(edgeDatasetDescriptions)

  // router
  const router = express.Router()

  router.route('/edges')
    // return list of all available datasets and metadata
    .get(function (req, res, next) {
      res.json(edgeDatasetDescriptions)
    })

  router.route('/edges/:datasetKey')
    // return list of attributes of single dataset
    .get(function (req, res, next) {
      res.json(edgeDatasetDescriptions[req.params.datasetKey])
    })
    // return data based on query
    // query params are sent in the request body
    .post(cache.leveldbCache, (req, res, next) => {
      res.set('Content-Type', 'text/plain')
      // initiate query
      const query = parseDataset(req.body, edgeDatabases, edgeDatasetDescriptions)
      console.log(query.toString())

      const getWeight = weightGetter(req.body, edgeDatasetDescriptions)

      query.then(rows => {
        res.send(JSON.stringify(convertToSpipFormat(rows, getWeight)))
      })
    })

  return router
}

function parseDataset (parameters, edgeDatabases, edgeDatasetDescriptions) {
  const db = edgeDatabases[parameters.datasetKey]
  const datasetDescription = edgeDatasetDescriptions[parameters.datasetKey]
  const source = datasetDescription.spatialUnits[parameters.spatialUnits].sourceName
  const sink = datasetDescription.spatialUnits[parameters.spatialUnits].sinkName

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
    queryWhereTotal, source, sink, datasetDescription.count, datasetDescription.weight, datasetDescription.countType
  )

  // set group by
  const queryGroupBy = (datasetDescription.groupBy)
    ? querySelected.groupBy(source, sink)
    : querySelected

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
// look up the field type in the dataset-description object (e.g. range, category) and create where syntax accordingly
function whereKnex (query, fields, datasetDescription) {
  for (const field in fields) {
    if (fields[field] && !isEmptyObject(fields[field])) {
      switch (datasetDescription.fields[field].type) {
        case 'range':
          query = whereRange(query, field, fields[field])
          break
        case 'category':
          query = (datasetDescription.fields[field].multiple)
            ? whereCategoryMultiple(query, field, fields[field])
            : whereCategorySingle(query, field, fields[field])
          break
        case 'special':
          query = whereSpecial(query, fields[field], datasetDescription.fields[field].customLogic)
          break
      }
    } else {
      if (datasetDescription.hasNulls === true) query = whereNull(query, field, datasetDescription.fields[field].type)
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
function setRowSums (rowSum, parameters, edgeDatasetDescriptions) {
  const datasetDescription = edgeDatasetDescriptions[parameters.datasetKey]

  return (datasetDescription.rowSumCalculation)
    ? datasetDescription.rowSumCalculation(rowSum, parameters, datasetDescription)
    : rowSum
}

function weightGetter (body, edgeDatasetDescriptions) {
  return sum => Math.round(setRowSums(sum, body, edgeDatasetDescriptions))
}

function convertToSpipFormat (rows, getWeight) {
  const idToRowNumber = new Map()

  const dataInSpipFormat = {
    a: [],
    b: [],
    countAB: [],
    countBA: [],
    weightAB: [],
    weightBA: []
  }

  let rowNumber = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const weight = getWeight(row.sum)

    if (anyValueMissing(row, weight)) {
      continue
    }

    const source = row.source.toString()
    const sink = row.sink.toString()

    const reverseId = getId(sink, source)

    if (idToRowNumber.has(reverseId)) {
      const reverseRowNumber = idToRowNumber.get(reverseId)

      dataInSpipFormat.countBA[reverseRowNumber] = row.count
      dataInSpipFormat.weightBA[reverseRowNumber] = weight
    } else {
      const id = getId(source, sink)
      idToRowNumber.set(id, rowNumber)
      rowNumber++

      dataInSpipFormat.a.push(source)
      dataInSpipFormat.b.push(sink)
      dataInSpipFormat.countAB.push(row.count)
      dataInSpipFormat.countBA.push(0)
      dataInSpipFormat.weightAB.push(weight)
      dataInSpipFormat.weightBA.push(0)
    }
  }

  return sortByWeightSum(dataInSpipFormat)
}

function anyValueMissing (row, weight) {
  return (
    row.source === null ||
    row.sink === null ||
    row.count === null ||
    weight === null
  )
}

function getId (a, b) {
  return `${a}-${b}`
}

function sortByWeightSum (dataInSpipFormat) {
  const length = dataInSpipFormat.a.length
  const indexColumn = Array(length).fill(0).map((_, i) => i)

  indexColumn.sort((a, b) => {
    const weightSumA = dataInSpipFormat.weightAB[a] + dataInSpipFormat.weightBA[a]
    const weightSumB = dataInSpipFormat.weightAB[b] + dataInSpipFormat.weightBA[b]

    return weightSumA - weightSumB
  })

  for (const columnName in dataInSpipFormat) {
    dataInSpipFormat[columnName] = indexColumn.map(index => dataInSpipFormat[columnName][index])
  }

  return dataInSpipFormat
}
