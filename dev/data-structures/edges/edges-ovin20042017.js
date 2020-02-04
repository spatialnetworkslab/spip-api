// this should be stored in a database instead. but we start off in plain js to help construct the final structure
export default {
  name: 'Verplaatsingen 2004-2017',
  shortName: 'ovin20042017',
  description: 'Deze dataset is gebaseerd op het Onderzoek Verplaatsingen in Nederland (OViN) voor de jaren 2004-2017',
  type: 'edges',
  id: 9, // this is the current 'migration' id
  db: 'dev/data/sqlite/edges-ovin-2017.sqlite',
  rowSumCalculation: function (sum, parameters) {
    // years should be calculated based on req.parameters
    const years = parameters.fields.year[1] - parameters.fields.year[0] + 1
    return sum / (years * 365)
  },
  spatialUnits: {
    municipalities: {
      table: 'ovin20042017',
      sourceName: 'c_vgemf',
      sinkName: 'c_agemf'
    },
    postcodes: {
      table: 'ovin20042017',
      sourceName: 'c_vpcf',
      sinkName: 'c_apcf'
    }
  },
  count: 'factorv',
  countType: 'rowIsIndividual',
  weight: 'factorv',
  groupBy: true,
  fields: {
    year: {
      name: 'Periode',
      description: 'A longer description can be included here',
      type: 'range',
      min: 2004,
      max: 2017
    },
    c_lft: {
      name: 'Leeftijd',
      description: 'A longer description can be included here',
      type: 'range',
      min: 0,
      max: 99
    },
    c_motief: {
      name: 'Motief',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'Van en naar het werk',
        2: 'Zakelijk bezoek',
        3: 'Diensten/Persoonlijke Verzorging',
        4: 'Winkelen/boodschappen doen',
        5: 'Onderwijs volgen',
        6: 'Visite/logeren',
        7: 'Sociaal recreatief overig',
        8: 'Toeren/wandelen',
        9: 'Overig, incl. diensten/zorg'
      }
    },
    c_modus: {
      name: 'Modus',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'Auto als bestuurder of passagier',
        2: 'Trein, Bus/tram/metro',
        3: 'Lopen, Fiets, Bromfiets',
        4: 'Overig'
      }
    },
    c_opl: {
      name: 'Opleiding',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'BO/LO, LBO / VGLO / LAVO / MAVO / MULO',
        2: 'MBO / HAVO / Atheneum / Gymnasium / MMS / HBS',
        3: 'HBO/Universiteit',
        4: 'Overig',
        0: 'Onbekend'
      }
    },
    c_hhtype: {
      name: 'Huishoudtype',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'Eenpersoonshuishouden',
        2: 'Paar zonder kinderen',
        3: 'Paar + kind(eren)',
        4: '1 oudergezin',
        5: 'Overig'
      }
    },
    c_maatsch: {
      name: 'Maatschappelijke Participatie',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'Werkzaam 12-30 uur per week',
        2: 'Werkzaam ≥ 30 uur per week',
        3: 'Eigen huishouding',
        4: 'Scholier/student',
        5: 'Werkloos/WAO',
        6: 'Gepensioneerd/VUT',
        7: 'Overig',
        8: 'Nvt'
      }
    },
    hhfilter: {
      name: 'Huishoudfilter',
      description: 'A longer description can be included here',
      type: 'special',
      specialType: {
        type: 'category',
        multiple: false
      },
      possible: {
        0: 'Uit',
        1: 'Aan'
      },
      defaultValue: 0,
      customLogic: function (query, hhfilter) {
        if (hhfilter === '1') {
          const subquery = query.clone()
            .groupBy('year', 'hhid', 'c_apc', 'c_vpcf', 'c_apcf')
          return query
            .from(subquery.as('hhfilter'))
        }
      }
    }
  }
}
