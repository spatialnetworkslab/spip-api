// this should be stored in a database instead. but we start off in plain js to help construct the final structure
export default {
  name: 'CVTO Microdata 2004-2014',
  shortName: 'cvto',
  description: 'Deze dataset is gebaseerd op CVTO microdata voor de jaren 2004-2014, met data voor elk even jaar. Alleen cellen met meer dan 10 personen zijn opgenomen vanwege privacy waarborg.',
  type: 'edges',
  id: 8, // this is the current 'migration' id
  db: 'dev/data/sqlite/edges-cvto.sqlite',
  rowSumCalculation: function (sum, parameters) {
    // years should be calculated based on req.parameters
    const roundUp = n => n + (n % 2)
    const roundDown = n => n - (n % 2)
    const years = ((
      roundDown(parameters.fields.year[1]) -
      roundUp(parameters.fields.year[0])
    ) / 2) + 1
    return sum / (years * 365)
  },
  spatialUnits: {
    municipalities: {
      table: 'cvto',
      sourceName: 'source',
      sinkName: 'sink'
    }
  },
  count: 'weight',
  countType: 'rowIsIndividual',
  weight: 'weight',
  groupBy: true,
  fields: {
    year: {
      name: 'Periode',
      description: 'A longer description can be included here',
      type: 'range',
      min: 2004,
      max: 2014
    },
    ACTIV_T: {
      name: 'Activiteitstype',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'Buitenrecreatie',
        2: 'Watersport',
        3: 'Sport',
        4: 'Bezoek sportwedstrijden',
        5: 'Wellness',
        6: 'Bezoek attracties',
        7: 'Bezoek evenementen',
        8: 'Winkelen voor plezier',
        9: 'Cultuur',
        10: 'Uitgaan',
        11: 'Verenigingsactiviteiten en hobby\'s'
      }
    },
    VERVOERM: {
      name: 'Modus',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'Auto',
        2: 'Motor',
        3: 'Fiets',
        4: 'Trein',
        5: 'Streek- en lijnbus',
        6: 'Touringcar',
        7: 'Te voet',
        8: 'Overig OV',
        9: 'Direct van huis',
        10: 'Overig'
      }
    },
    SOCKLAS: {
      name: 'Sociale klasse',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'A (Hoog)',
        2: 'Bb',
        3: 'Bo',
        4: 'C-D (Laag)'
      }
    },
    age: {
      name: 'Leeftijd',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'jonger dan 18 jaar',
        2: '18-29 jaar',
        3: '30-39 jaar',
        4: '40-49 jaar',
        5: '50-59 jaar',
        6: '60 of ouder'
      }
    },
    gezinsgrootte: {
      name: 'Gezinsgrootte',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: '1 persoon',
        2: '2 personen',
        3: '3 personen',
        4: '4+ personen'
      }
    },
    gezinstype: {
      name: 'Gezinstype',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: true,
      possible: {
        1: 'Alleenstaand',
        2: 'Gezin zonder kinderen',
        3: 'Gezin met kinderen'
      }
    }
  }
}
