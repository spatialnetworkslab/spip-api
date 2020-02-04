// this should be stored in a database instead. but we start off in plain js to help construct the final structure
export default {
  name: 'Baangegevens Woonadres 2016',
  shortName: 'baangegevens woon',
  description: 'Deze dataset is gebaseerd op CBS microdata voor de jaren 1999-2014. Alleen cellen met meer dan 10 personen zijn opgenomen vanwege privacy waarborg.',
  type: 'nodes',
  id: 10, // this is the current 'migration' id
  db: 'dev/data/sqlite/nodes-2016.sqlite',
  spatialUnits: {
    municipalities: {
      id: 'gem',
      table: 'woonwerk_woon_19992016_gem'
    },
    postcodes: {
      id: 'pc4',
      table: 'woonwerk_woon_19992016_pc'
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
        .whereNull('opl')
        .whereNull('inks')
        .whereNull('sectorcat')
        .whereNull('soortbaan')
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
        2007: '2007',
        2010: '2010',
        2014: '2014',
        2015: '2015',
        2016: '2016'
      },
      defaultValue: '2016'
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
    sectorcat: {
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
        7: 'Landbouw',
        8: 'Metaal- en maritieme industrie',
        9: 'Overig (uitzend & onbekend)'
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
    }
  }
}
