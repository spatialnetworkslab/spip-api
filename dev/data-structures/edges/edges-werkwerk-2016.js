// this should be stored in a database instead. but we start off in plain js to help construct the final structure
export default {
  name: 'Baanverhuizingen Microdata 2016',
  shortName: 'werkwerk',
  description: 'Deze dataset is gebaseerd op CBS microdata voor de jaren 1999-2016. Alleen cellen met meer dan 10 personen zijn opgenomen vanwege privacy waarborg.',
  type: 'edges',
  id: 8, // this is the current 'migration' id
  db: 'dev/data/sqlite/edges-werkwerk-2016.sqlite',
  spatialUnits: {
    municipalities: {
      table: 'werkwerk_19992016_gem',
      sourceName: 'GEMy1',
      sinkName: 'GEMy2'
    }
  },
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
  hasNulls: true,
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
        .whereNotNull('age')
        .whereNull('opl')
        .whereNull('inks')
        .whereNull('sectorcat2')
        .whereNull('sectorsector')
        .whereNull('soortbaan')
        .where('year', parameters.fields.year)
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
        '07-10': '2007-2010',
        '11-14': '2011-2014',
        '12-15': '2012-2015',
        '13-16': '2013-2016',
        '07-16': '2007-2016'
      },
      defaultValue: '13-16'
    },
    age: {
      name: 'Leeftijd',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'jonger dan 18',
        2: '18-23',
        3: '24-29',
        4: '30-40',
        5: '40-59',
        6: '60+'
      }
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
    sectorcat2: {
      name: 'Sector',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'Materiaalgericht: Productie',
        2: 'Materiaalgericht: Dienstverlening',
        3: 'Informatiegericht: Commercieel',
        4: 'Informatiegericht: Publiek (Quartair)',
        5: 'Persoonsgericht: Retail, Ambacht, Horeca & Vervoer',
        6: 'Persoonsgericht: Zorg, Onderwijs, Cultuur',
        7: 'Overig (uitzend & onbekend)',
        8: 'Landbouw',
        9: 'Metaal- en maritieme industrie'
      }
    },
    sectorsector: { // TODO spit this out so you can select sector in Y1 and sector in Y2
      name: 'Sectorverandering',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: '1-1',
        2: '1-2',
        3: '1-3',
        4: '1-4',
        5: '1-5',
        6: '1-6',
        7: '1-7',
        8: '2-1',
        9: '2-2',
        10: '2-3',
        11: '2-4',
        12: '2-5',
        13: '2-6',
        14: '2-7',
        15: '3-1',
        16: '3-2',
        17: '3-3',
        18: '3-4',
        19: '3-5',
        20: '3-6',
        21: '3-7',
        22: '4-1',
        23: '4-2',
        24: '4-3',
        25: '4-4',
        26: '4-5',
        27: '4-6',
        28: '4-7',
        29: '5-1',
        30: '5-2',
        31: '5-3',
        32: '5-4',
        33: '5-5',
        34: '5-6',
        35: '5-7',
        36: '6-1',
        37: '6-2',
        38: '6-3',
        39: '6-4',
        40: '6-5',
        41: '6-6',
        42: '6-7',
        43: '7-1',
        44: '7-2',
        45: '7-3',
        46: '7-4',
        47: '7-5',
        48: '7-6',
        49: '7-7',
        50: '8-8',
        51: '9-9'
      }
    },
    soortbaan: {
      name: 'Soort Baan',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'DGA',
        2: 'Overig',
        3: 'Stagaire, WSW, Oproep, Uitzend'
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
