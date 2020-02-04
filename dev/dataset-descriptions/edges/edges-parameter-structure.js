// test parameters
export const parameters = {
  dataset: 'ovin20042015', // shortName
  spatialUnits: 'municipalities',
  fields: {
    year: [2004, 2015],
    c_lft: [0, 99],
    c_motief: [2, 3],
    c_modus: [1],
    c_opl: null,
    c_hhtype: null,
    c_maatsch: null,
    hhfilter: null
  }
}

// for use in postman
// {
//   "dataset": "ovin20042015",
//   "spatialUnits": "municipalities",
//   "fields": {
//     "year": [2004, 2015],
//     "c_lft": [0, 99],
//     "c_motief": [2, 3],
//     "c_modus": [1],
//     "c_opl": null,
//     "c_hhtype": null,
//     "c_maatsch": null,
//     "hhfilter": null
//   }
// }
