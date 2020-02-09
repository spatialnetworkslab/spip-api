// this should be stored in a database instead. but we start off in plain js to help construct the final structure
export default {
  name: 'Persoonsgegevens 2015',
  shortName: 'persoonsgegevens',
  description: 'Deze dataset is gebaseerd op CBS microdata voor de jaren 1999-2014. Alleen cellen met meer dan 10 personen zijn opgenomen vanwege privacy waarborg.',
  type: 'nodes',
  id: 8, // this is the current 'migration' id
  db: 'dev/datasets/nodes-2015.sqlite',
  spatialUnits: {
    municipalities: {
      id: 'gem',
      table: 'demographics19992015_gem'
    },
    postcodes: {
      id: 'pc4',
      table: 'demographics19992015_pc'
    }
  },
  count: 'value',
  weight: 'value',
  groupBy: true,
  total: function (query, parameters) {
    // count how many fields apart from year have non null values
    // if none do, count will be 0 and we need to return the total for that year
    let count = 0
    for (const field in parameters.fields) {
      if (field !== 'year' && parameters.fields[field]) {
        count += 1
      }
    }
    if (count > 0) {
      return query
    } else {
      return query.clearWhere()
        .whereNotNull('age')
        .whereNull('sec')
        .whereNull('hh')
        .whereNull('opl')
        .whereNull('inks')
        .where('year', parameters.fields.year)
    }
  },
  fields: {
    year: {
      name: 'Jaar',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: false,
      possible: {
        1999: '1999',
        2002: '2002',
        2006: '2006',
        2010: '2010',
        2014: '2014',
        2015: '2015'
      },
      defaultValue: '2015'
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
    sec: {
      name: 'Sociaal-Economische Positie',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: '\'actief\' (werkend, DGA , zelfstand of overig actief)',
        2: 'ontvanger uitkering (ex. Pensioen)',
        3: 'pensioen',
        4: 'scholier/student'
      }
    },
    hh: {
      name: 'Huishoudtype',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'eenpersoonshuishouden',
        2: 'paar zonder kinderen',
        3: '1-ouder met kinderen',
        4: 'overig'
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
    }
  }
}
