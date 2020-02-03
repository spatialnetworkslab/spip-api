export const structure = {
  name: 'Vierkante kilometers',
  shortName: 'sq km',
  description: 'Deze dataset bevat het oppervlakte in vierkante kilometers per ruimtelijke eenheid.',
  type: 'nodes',
  id: 12, // this is the current 'migration' id
  db: 'dev/data/sqlite/nodes-2015.sqlite',
  spatialUnits: {
    municipalities: {
      id: 'gem',
      table: 'square_kilometers_gm'
    },
    postcodes: {
      id: 'pc4',
      table: 'square_kilometers_pc'
    }
  },
  count: 'value',
  weight: 'value',
  groupBy: true,
  fields: {}
}
