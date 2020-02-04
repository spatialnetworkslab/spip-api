export default {
  name: 'Banen SBI Zuid-Holland 2015',
  shortName: 'banen sbi zh',
  description: 'Deze dataset is gebaseerd op de LISA bedrijfslocaties dataset. \n' +
                 'Bevat alleen banen in Zuid-Holland.',
  type: 'nodes',
  id: 11,
  db: 'dev/datasets/nodes-2015.sqlite',
  spatialUnits: {
    municipalities: {
      id: 'gem',
      table: 'werk_sbi_19992015_gem_update'
    },
    postcodes: {
      id: 'pc4',
      table: 'werk_sbi_19992015_pc_update'
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
        .whereNull('sbi_2')
        .whereNull('sbi_5')
        .where('year', parameters.fields.year)
    }
  },
  fields: {
    year: {
      name: 'Jaar',
      description: 'A longer description can be included here.',
      type: 'category',
      multiple: false,
      possible: {
        1999: '1999',
        2000: '2000',
        2001: '2001',
        2002: '2002',
        2003: '2003',
        2004: '2004',
        2005: '2005',
        2006: '2006',
        2007: '2007',
        2008: '2008',
        2009: '2009',
        2010: '2010',
        2011: '2011',
        2012: '2012',
        2013: '2013',
        2014: '2014',
        2015: '2015'
      },
      defaultValue: '2015'
    },
    sbiType: {
      name: 'SBI code type',
      description: 'A longer description can be included here',
      type: 'category',
      multiple: false,
      possible: {
        sbi_2: 'SBI 2-digit',
        sbi_5: 'SBI 5-digit'
      },
      defaultValue: 'sbi_2',
      removeFromQuery: true
    },
    sbi_2: {
      name: 'SBI 2-digit',
      description: 'A longer description can be included here.',
      type: 'categoryCode',
      multiple: true,
      digits: [2, 2],
      if: {
        variable: 'sbiType',
        logical: '===',
        value: 'sbi_2'
      }
    },
    sbi_5: {
      name: 'SBI 5-digit',
      description: 'A longer description can be included here.',
      type: 'categoryCode',
      multiple: true,
      digits: [4, 5],
      if: {
        variable: 'sbiType',
        logical: '===',
        value: 'sbi_5'
      }
    }
  }
}
