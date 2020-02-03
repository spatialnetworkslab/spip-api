// this should be stored in a database instead. but we start off in plain js to help construct the final structure
export const structure = {
  name: 'Verhuizingen Microdata 2016',
  shortName: 'migration',
  description: 'Deze dataset is gebaseerd op CBS microdata voor de jaren 1999-2016. Alleen cellen met meer dan 10 personen zijn opgenomen vanwege privacy waarborg.',
  type: 'edges',
  id: 8, // this is the current 'migration' id
  db: 'dev/data/sqlite/edges-migration-2016.sqlite',
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
        .whereNull('sec')
        .whereNull('hh')
        .whereNull('inkchanges')
        .where('year', parameters.fields.year)
    }
  },
  spatialUnits: {
    municipalities: {
      table: 'verhuizingen_19992016_gem',
      sourceName: 'gemPre',
      sinkName: 'gemPost'
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
        'p13-16': '2013-2016'
      },
      defaultValue: 'p13-16'
    },
    age: {
      name: 'Leeftijd',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: '12-18',
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
    sec: {
      name: 'Sociaal-Economische Positie',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: "Voor en na verhuizing 'actief' (werkend, DGA , zelfstand of overig actief)",
        2: 'Voor en na verhuizing ontvanger uitkering (ex. Pensioen)',
        3: 'Voor en na verhuizing pensioen',
        4: 'Voor en na verhuizing scholier/student',
        5: 'Voor verhuizing actief, na verhuizing pensioen',
        6: 'Voor verhuizing scholier/student, na verhuizing actief',
        7: 'Voor scholier/student, na uitkering',
        8: 'Voor actief, na uitkering',
        9: 'Voor uitkering, na actief',
        10: 'Voor en na verhuizing scholier/student, gecombineerd met voor verhuizing huishouden met kinderen, na verhuizing huishouden zonder kinderen'
      }
    },
    hh: {
      name: 'Huishoudtype',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'Voor en na eenpersoonshuishouden',
        2: 'Voor en na paar zonder kinderen',
        3: 'Voor en na paar of 1-ouder met kinderen',
        4: 'Voor en na overig',
        5: 'Voor 1persoons, na paar zonder kinderen',
        6: 'Voor paar zonder kinderen, na paar met kinderen',
        7: 'Voor paar zonder kinderen, na eenpersoonshuishouden',
        8: 'Voor paar met kinderen, na paar zonder kinderen'
      }
    },
    inkchanges: {
      name: 'Inkomenverandering',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: '< -15%',
        2: '-15 - 0%',
        3: '0-10%',
        4: '10-25%',
        5: '>25%'
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
