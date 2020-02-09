// this should be stored in a database instead. but we start off in plain js to help construct the final structure
export default {
  name: 'Woon-Werk Microdata Zorg',
  shortName: 'woonwerk',
  description: 'Deze dataset is gebaseerd op CBS microdata voor de jaren 1999-2016. Alleen cellen met meer dan 10 personen zijn opgenomen vanwege privacy waarborg.',
  type: 'edges',
  id: 8, // this is the current 'migration' id
  db: 'dev/datasets/edges-zorg-2016.sqlite',
  hasNulls: true,
  rowSumCalculation: function (sum, parameters, structure) {
    // years should be calculated based on req.parameters
    if (parameters.fields.divideYears === '1') {
      const range = structure.fields.year.possible[parameters.fields.year].split('-')
      const years = range[1] - range[0] + 1
      return sum / years
    } else {
      return sum
    }
  },
  total: function (query, parameters) {
    // count how many fields apart from year have non null values
    // if none do, count will be 0 and we need to return the total for that year
    let count = 0
    for (const field in parameters.fields) {
      if (field !== 'year' && field !== 'divideYears' && parameters.fields[field]) {
        count += 1
      }
    }
    if (count > 0) {
      return query
    } else {
      return query.clearWhere()
        .whereNotNull('sectorcat')
        .whereNull('opl')
        .whereNull('inks')
        .where('year', parameters.fields.year)
    }
  },
  spatialUnits: {
    municipalities: {
      table: 'woonwerk_zorg_gem',
      sourceName: 'woongem',
      sinkName: 'werkgem'
    },
    postcodes: {
      table: 'woonwerk_zorg_pc',
      sourceName: 'woonpostcode',
      sinkName: 'werkpostcode'
    }
  },
  count: 'value',
  countType: 'rowIsAggregation',
  weight: 'value',
  groupBy: true,
  fields: {
    year: {
      name: 'Periode',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: false,
      possible: {
        20072010: '2007-2010',
        20112014: '2011-2014',
        20122015: '2012-2015',
        20132016: '2013-2016'
      },
      defaultValue: '20132016'
    },
    opl: {
      name: 'Opleiding',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'Laag (SOI2006 < 40)',
        2: 'Midden (SOI2006 > 39 & < 50)',
        3: 'Hoog (SOI2006 > 60)'
      }
    },
    inks: {
      name: 'Brutoinkomen',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: '< 20%',
        2: '20-40%',
        3: '40-60%',
        4: '60-80%',
        5: '80-100%'
      }
    },
    sectorcat: {
      name: 'Sector',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'Zorg (rijksmiddelen)',
        2: 'Zorg (gemeentemiddelen)'
      }
    },
    divideYears: {
      name: 'Data Per Jaar',
      description: 'A longer description can be included here',
      type: 'special',
      specialType: {
        type: 'category',
        multiple: false
      },
      possible: {
        0: 'Nee',
        1: 'Aan'
      },
      defaultValue: 0,
      customLogic: function (query, value) {
        return query
      }
    }
  }
}
