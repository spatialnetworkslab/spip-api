export default {
  files: [
    { id: 'munis', location: 'static/topojson_data/gem2016.topojson' },
    { id: 'pcs', location: 'static/topojson_data/pc4.topojson' },
    { id: 'buildup', location: 'static/topojson_data/buildup-simple.json' },
    { id: 'labels', location: 'static/topojson_data/labels.topojson' },
    { id: 'provinces', location: 'static/topojson_data/prov_2014.topojson' },
    { id: 'amRegios', location: 'static/topojson_data/amRegio.topojson' },
    { id: 'subregiosZH', location: 'static/topojson_data/subregios_zh.topojson' },
    { id: 'regiosZH', location: 'static/topojson_data/regios_zh.topojson' }
  ],

  globalSettings: {
    projection: 'cartesian'
  },

  spatialUnits: {
    default: 'municipalities',

    units: [
      {
        id: 'municipalities',
        name: 'Gemeentes',
        shortName: 'mn',
        file: 'munis',
        fileLayer: 'gem2016',
        nameField: 'GM_NAAM'
      },

      {
        id: 'postcodes',
        name: 'Postcodes',
        shortName: 'pc',
        file: 'pcs',
        fileLayer: 'pc4-test',
        nameField: 'PC4'
      }
    ]
  },

  defaultEdges: {
    'id': 'default',
    'name': 'Default',
    'fileLocation': 'api/edges/ovin',
    'parameters': {
      'dataset': 'ovin-2', // shortName
      'spatialUnits': 'municipalities',
      'fields': {
        'year': [2004, 2017],
        'c_lft': [0, 99],
        'c_motief': null,
        'c_modus': null,
        'c_opl': null,
        'c_hhtype': null,
        'c_maatsch': null,
        'hhfilter': null
      }
    }
  },

  buildUpLayer: {
    file: 'buildup',
    fileLayer: 'bebouwd_simplify.geojson'
  },

  labels: [
    {
      file: 'labels',
      fileLayer: 'kernen1',
      zoomTreshold: 0,
      fontSize: 11
    },
    {
      file: 'labels',
      fileLayer: 'kernen2',
      zoomTreshold: 2.25,
      fontSize: 8
    },
    {
      file: 'labels',
      fileLayer: 'kernen3',
      zoomTreshold: 4.5,
      fontSize: 5
    }
  ],

  referenceLayers: [
    {
      file: 'munis',
      fileLayer: 'gem2016',
      name: 'municipalityLayer',
      layerDefaults: {
        name: 'Municipalities',
        visible: false,
        strokeColor: 'rgba(0, 0, 0, 1)',
        fillColor: 'rgba(0, 0, 0, 0)',
        strokeWidth: 0.5
      }
    },

    {
      file: 'provinces',
      fileLayer: 'prov',
      name: 'provinceLayer',
      layerDefaults: {
        name: 'Provinces',
        visible: true,
        strokeColor: 'rgba(0, 0, 0, 1)',
        fillColor: 'rgba(0, 0, 0, 0)',
        strokeWidth: 0.5
      }
    },

    {
      file: 'amRegios',
      fileLayer: 'arbeidsmarktregio',
      name: 'laborMarketLayer',
      layerDefaults: {
        name: 'Labor Markets',
        visible: false,
        strokeColor: 'rgba(211, 168, 40, 0.6)',
        fillColor: 'rgba(0, 0, 0, 0)',
        strokeWidth: 2.5
      }
    },

    {
      file: 'subregiosZH',
      fileLayer: 'subregios_zh',
      name: 'zhSubRegioLayer',
      layerDefaults: {
        name: 'ZH Sub-regios',
        visible: false,
        strokeColor: 'rgba(211, 168, 40, 0.6)',
        fillColor: 'rgba(0, 0, 0, 0)',
        strokeWidth: 2.5
      }
    },

    {
      file: 'regiosZH',
      fileLayer: 'regios_zh',
      name: 'zhRegioLayer',
      layerDefaults: {
        name: 'ZH Regios',
        visible: false,
        strokeColor: 'rgba(211, 168, 40, 0.6)',
        fillColor: 'rgba(0, 0, 0, 0)',
        strokeWidth: 2.5
      }
    }
  ]
}
