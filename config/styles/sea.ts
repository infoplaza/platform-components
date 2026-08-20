export const SEA_MARINE_STYLE = {
    "version": 8,
    "name": "imweather-sea",
    "metadata": {
      "mapbox:autocomposite": false,
      "mapbox:type": "template",
      "mapbox:groups": {
        "b6371a3f2f5a9932464fa3867530a2e5": {
          "name": "Transportation",
          "collapsed": false
        },
        "a14c9607bc7954ba1df7205bf660433f": {
          "name": "Boundaries"
        },
        "101da9f13b64a08fa4b6ac1168e89e5f": {
          "name": "Places",
          "collapsed": false
        }
      },
      "openmaptiles:version": "3.x",
      "openmaptiles:mapbox:owner": "infoplaza",
      "maputnik:renderer": "mbgljs"
    },
    "center": [
      10.184401828277089,
      -1.1368683772161603e-13
    ],
    "zoom": 1,
    "bearing": 0,
    "pitch": 0,
    "sources": {
      "openmaptiles": {
        "type": "vector",
        "url": "https://maps.meteoplaza.com/data/planetosm.json"
      },
      "land": {
        "type": "vector",
        "url": "https://maps.meteoplaza.com/data/land.json"
      },
      "coastlines": {
        "type": "vector",
        "url": "https://maps.meteoplaza.com/data/coastlines.json"
      },
      "bluemarble": {
        "type": "raster",
        "url": "https://maps.meteoplaza.com/data/bluemarble_bathymetry.json"
      },
      "lakes": {
        "type": "vector",
        "url": "https://maps.meteoplaza.com/data/lakes.json"
      },
      "hillshade": {
        "type": "raster",
        "url": "https://maps.meteoplaza.com/data/hillshade.json"
      }
    },
    "sprite": "https://maps.meteoplaza.com/styles/imweather-sea/sprite",
    "glyphs": "https://maps.meteoplaza.com/fonts/{fontstack}/{range}.pbf",
    "layers": [
      {
        "id": "background",
        "type": "background",
        "minzoom": 0,
        "maxzoom": 17,
        "paint": {
          "background-color": "rgba(255, 242, 160, 0.69)",
          "background-opacity": 1
        }
      },
      {
        "id": "ice",
        "type": "fill",
        "source": "openmaptiles",
        "source-layer": "landcover",
        "filter": [
          "all",
          [
            "==",
            "class",
            "ice"
          ]
        ],
        "layout": {
          "visibility": "none"
        },
        "paint": {
          "fill-color": "rgba(255, 255, 255, 1)"
        }
      },
      {
        "id": "bluemarble",
        "type": "raster",
        "source": "bluemarble",
        "minzoom": 0,
        "maxzoom": 9,
        "filter": [
          "all"
        ],
        "layout": {
          "visibility": "none"
        },
        "paint": {
          "raster-opacity": {
            "stops": [
              [
                6,
                0.5
              ],
              [
                9,
                0
              ]
            ]
          }
        }
      },
      {
        "id": "water",
        "type": "fill",
        "source": "openmaptiles",
        "source-layer": "water",
        "filter": [
          "all",
          [
            "==",
            "$type",
            "Polygon"
          ],
          [
            "!=",
            "brunnel",
            "tunnel"
          ]
        ],
        "layout": {
          "visibility": "visible"
        },
        "paint": {
          "fill-color": "rgba(187,206,234, 1)",
          "fill-antialias": true
        }
      },
      {
        "id": "lakes-XL",
        "type": "fill",
        "source": "lakes",
        "source-layer": "lakesgeojson",
        "minzoom": 7,
        "maxzoom": 14,
        "filter": [
          "all",
          [
            ">=",
            "area",
            0.2
          ]
        ],
        "layout": {
          "visibility": "visible"
        },
        "paint": {
          "fill-color": "rgba(187,206,234, 1)"
        }
      },
      {
        "id": "lakes-L",
        "type": "fill",
        "source": "lakes",
        "source-layer": "lakesgeojson",
        "minzoom": 7,
        "maxzoom": 14,
        "filter": [
          "all",
          [
            ">=",
            "area",
            0.01
          ],
          [
            "<",
            "area",
            0.2
          ]
        ],
        "layout": {
          "visibility": "visible"
        },
        "paint": {
          "fill-color": "rgba(187,206,234, 1)"
        }
      },
      {
        "id": "lakes-M",
        "type": "fill",
        "source": "lakes",
        "source-layer": "lakesgeojson",
        "minzoom": 7,
        "maxzoom": 14,
        "filter": [
          "all",
          [
            ">=",
            "area",
            0.001
          ],
          [
            "<",
            "area",
            0.01
          ]
        ],
        "layout": {
          "visibility": "visible"
        },
        "paint": {
          "fill-color": "rgba(187,206,234, 1)"
        }
      },
      {
        "id": "lakes-S",
        "type": "fill",
        "source": "lakes",
        "source-layer": "lakesgeojson",
        "minzoom": 9,
        "maxzoom": 14,
        "filter": [
          "all",
          [
            ">=",
            "area",
            0.0001
          ],
          [
            "<",
            "area",
            0.001
          ]
        ],
        "layout": {
          "visibility": "visible"
        },
        "paint": {
          "fill-color": "rgba(187,206,234, 1)"
        }
      },
      {
        "id": "lakes-XS",
        "type": "fill",
        "source": "lakes",
        "source-layer": "lakesgeojson",
        "minzoom": 10,
        "maxzoom": 14,
        "filter": [
          "all",
          [
            "<",
            "area",
            0.0001
          ]
        ],
        "layout": {
          "visibility": "visible"
        },
        "paint": {
          "fill-color": "rgba(187,206,234, 1)",
          "fill-opacity": 1
        }
      },
      {
        "id": "lakes-transparent",
        "type": "fill",
        "source": "lakes",
        "source-layer": "lakesgeojson",
        "minzoom": 0,
        "maxzoom": 5,
        "filter": [
          "all",
          [
            ">=",
            "area",
            0.0001
          ],
          [
            "<",
            "area",
            0.001
          ]
        ],
        "layout": {
          "visibility": "none"
        },
        "paint": {
          "fill-color": "rgba(32, 35, 36, 0.75)",
          "fill-opacity": {
            "stops": [
              [
                9,
                0.05
              ],
              [
                14,
                0.4
              ]
            ]
          }
        }
      },
      {
            "id": "landcover",
            "type": "fill",
            "source": "land",
            "source-layer": "landgeojson",
            "paint": {
                "fill-color": "#fbf2b8"
            }
        },
      {
        "id": "housing",
        "type": "fill",
        "source": "openmaptiles",
        "source-layer": "landuse",
        "minzoom": 9,
        "maxzoom": 24,
        "filter": [
          "all",
          [
            "in",
            "class",
            "residential",
            "industrial",
            "commercial"
          ]
        ],
        "layout": {
          "visibility": "none"
        },
        "paint": {
          "fill-color": "rgba(0, 0, 0, 1)",
          "fill-opacity": {
            "stops": [
              [
                9,
                0.05
              ],
              [
                14,
                0.4
              ]
            ]
          }
        }
      },
      {
        "id": "farmland-etc",
        "type": "fill",
        "source": "openmaptiles",
        "source-layer": "landcover",
        "minzoom": 10,
        "maxzoom": 22,
        "filter": [
          "all",
          [
            "in",
            "class",
            "farmland",
            "grass"
          ]
        ],
        "layout": {
          "visibility": "none"
        },
        "paint": {
          "fill-color": "rgba(26, 82, 10, 1)",
          "fill-opacity": 0.1
        }
      },
      {
        "id": "river",
        "type": "line",
        "source": "openmaptiles",
        "source-layer": "waterway",
        "minzoom": 6,
        "maxzoom": 17,
        "layout": {
          "visibility": "visible"
        },
        "paint": {
          "line-width": {
            "stops": [
              [
                6,
                1
              ],
              [
                10,
                2
              ]
            ]
          },
          "line-color": "rgba(187,206,234, 1)",
          "line-opacity": {
            "stops": [
              [
                6,
                0.2
              ],
              [
                12,
                1
              ]
            ]
          }
        }
      },
      {
        "id": "boundary_state",
        "type": "line",
        "metadata": {
          "mapbox:group": "a14c9607bc7954ba1df7205bf660433f"
        },
        "source": "openmaptiles",
        "source-layer": "boundary",
        "minzoom": 5,
        "maxzoom": 10,
        "filter": [
          "all",
          [
            "==",
            "admin_level",
            4
          ],
          [
            "==",
            "maritime",
            0
          ],
          [
            "==",
            "disputed",
            0
          ]
        ],
        "layout": {
          "line-cap": "round",
          "line-join": "miter",
          "visibility": "visible"
        },
        "paint": {
          "line-color": "rgba(255, 255, 255, 0.25)",
          "line-width": {
            "base": 1.3,
            "stops": [
              [
                3,
                0.5
              ],
              [
                8,
                1
              ]
            ]
          },
          "line-blur": 0,
          "line-dasharray": [
            1,
            0
          ],
          "line-opacity": 1
        }
      },
      {
        "id": "boundary_state_disputed",
        "type": "line",
        "metadata": {
          "mapbox:group": "a14c9607bc7954ba1df7205bf660433f"
        },
        "source": "openmaptiles",
        "source-layer": "boundary",
        "minzoom": 5,
        "maxzoom": 10,
        "filter": [
          "all",
          [
            "==",
            "admin_level",
            4
          ],
          [
            "==",
            "maritime",
            0
          ],
          [
            "==",
            "disputed",
            1
          ]
        ],
        "layout": {
          "line-cap": "round",
          "line-join": "miter",
          "visibility": "visible"
        },
        "paint": {
          "line-color": "rgba(255, 255, 255, 0.25)",
          "line-width": {
            "base": 1.3,
            "stops": [
              [
                3,
                1
              ],
              [
                8,
                2
              ],
              [
                22,
                8
              ]
            ]
          },
          "line-blur": 0,
          "line-dasharray": [
            2,
            1
          ],
          "line-opacity": 1
        }
      },
      {
        "id": "boundary_coast_8",
        "type": "line",
        "metadata": {
          "mapbox:group": "a14c9607bc7954ba1df7205bf660433f"
        },
        "source": "openmaptiles",
        "source-layer": "water",
        "minzoom": 0,
        "maxzoom": 24,
        "filter": [
          "all",
          [
            "==",
            "class",
            "ocean"
          ]
        ],
        "layout": {
          "visibility": "visible",
          "line-cap": "butt",
          "line-join": "bevel"
        },
        "paint": {
          "line-color": "rgba(69, 69, 69, 1)",
          "line-width": {
            "stops": [
              [
                3,
                1
              ],
              [
                6,
                1.5
              ],
              [
                12,
                2
              ]
            ]
          }
        }
      },
      {
        "id": "boundary_coast_9",
        "type": "line",
        "metadata": {
          "mapbox:group": "a14c9607bc7954ba1df7205bf660433f"
        },
        "source": "openmaptiles",
        "source-layer": "water",
        "filter": [
          "all",
          [
            "==",
            "class",
            "lake"
          ]
        ],
        "minzoom": 0,
        "maxzoom": 24,
        "layout": {
          "visibility": "visible"
        },
        "paint": {
          "line-color": "rgba(69, 69, 69, 1)",
          "line-width": {
            "stops": [
              [
                3,
                1.5
              ],
              [
                6,
                1
              ],
              [
                12,
                0.5
              ]
            ]
          },
          "line-blur": 0,
          "line-opacity": 1
        }
      },
      {
        "id": "boundary_country",
        "type": "line",
        "metadata": {
          "mapbox:group": "a14c9607bc7954ba1df7205bf660433f"
        },
        "source": "openmaptiles",
        "source-layer": "boundary",
        "filter": [
          "all",
          [
            "==",
            "admin_level",
            2
          ],
          [
            "==",
            "maritime",
            0
          ],
          [
            "==",
            "disputed",
            0
          ],
          [
            "!in",
            "$id",
            1312,
            1314,
            1922,
            1873,
            371,
            369,
            370,
            1614,
            374,
            775
          ]
        ],
        "layout": {
          "line-cap": "square",
          "line-join": "miter",
          "visibility": "visible"
        },
        "paint": {
          "line-color": "rgba(100, 100, 100, 1)",
          "line-width": {
            "stops": [
              [
                3,
                0.5
              ],
              [
                6,
                1
              ],
              [
                12,
                2
              ]
            ]
          },
          "line-blur": 0,
          "line-opacity": 1
        }
      },
      {
        "id": "boundary_country_disputed",
        "type": "line",
        "metadata": {
          "mapbox:group": "a14c9607bc7954ba1df7205bf660433f"
        },
        "source": "openmaptiles",
        "source-layer": "boundary",
        "filter": [
          "all",
          [
            "==",
            "admin_level",
            2
          ],
          [
            "==",
            "maritime",
            0
          ],
          [
            "==",
            "disputed",
            1
          ]
        ],
        "layout": {
          "line-cap": "round",
          "line-join": "round",
          "visibility": "visible"
        },
        "paint": {
          "line-color": "rgba(0, 0, 0, 0.5)",
          "line-width": {
            "stops": [
              [
                3,
                0.5
              ],
              [
                6,
                1
              ]
            ]
          },
          "line-blur": 0,
          "line-dasharray": [
            1,
            3
          ],
          "line-opacity": 1
        }
      },
      {
        "id": "hillshade",
        "type": "raster",
        "source": "hillshade",
        "minzoom": 5,
        "maxzoom": 14,
        "layout": {
          "visibility": "none"
        },
        "paint": {
          "raster-opacity": {
            "stops": [
              [
                5,
                0.1
              ],
              [
                10,
                0.3
              ]
            ]
          }
        }
      },
      {
        "id": "road-tertiary",
        "type": "line",
        "source": "openmaptiles",
        "source-layer": "transportation",
        "minzoom": 12.5,
        "maxzoom": 24,
        "filter": [
          "all",
          [
            "in",
            "class",
            "tertiary",
            "service",
            "path",
            "minor"
          ],
          [
            "==",
            "$type",
            "LineString"
          ]
        ],
        "layout": {
          "visibility": "none"
        },
        "paint": {
          "line-color": "rgba(30, 30, 30, 1)",
          "line-width": 1.5,
          "line-opacity": 0.5
        }
      },
      {
        "id": "road-secondary",
        "type": "line",
        "source": "openmaptiles",
        "source-layer": "transportation",
        "minzoom": 11,
        "maxzoom": 24,
        "filter": [
          "all",
          [
            "in",
            "class",
            "trunk",
            "secondary"
          ],
          [
            "==",
            "$type",
            "LineString"
          ]
        ],
        "layout": {
          "visibility": "none",
          "line-cap": "square",
          "line-join": "bevel"
        },
        "paint": {
          "line-color": "rgba(30, 30, 30, 1)",
          "line-width": 2,
          "line-opacity": 1
        }
      },
      {
        "id": "road-primary",
        "type": "line",
        "source": "openmaptiles",
        "source-layer": "transportation",
        "minzoom": 10,
        "maxzoom": 24,
        "filter": [
          "all",
          [
            "in",
            "class",
            "primary"
          ],
          [
            "==",
            "$type",
            "LineString"
          ]
        ],
        "layout": {
          "visibility": "none",
          "line-cap": "square",
          "line-join": "bevel"
        },
        "paint": {
          "line-color": "rgba(30, 30, 30, 1)",
          "line-width": {
            "stops": [
              [
                9,
                1.5
              ],
              [
                14,
                2
              ]
            ]
          }
        }
      },
      {
        "id": "road-trunk",
        "type": "line",
        "source": "openmaptiles",
        "source-layer": "transportation",
        "minzoom": 10,
        "maxzoom": 24,
        "filter": [
          "all",
          [
            "in",
            "class",
            "trunk"
          ],
          [
            "==",
            "$type",
            "LineString"
          ]
        ],
        "layout": {
          "visibility": "none",
          "line-cap": "square",
          "line-join": "bevel"
        },
        "paint": {
          "line-color": "rgba(30, 30, 30, 1)",
          "line-width": {
            "stops": [
              [
                8,
                1.5
              ],
              [
                14,
                2
              ]
            ]
          }
        }
      },
      {
        "id": "road-snelweg",
        "type": "line",
        "source": "openmaptiles",
        "source-layer": "transportation",
        "minzoom": 8,
        "maxzoom": 24,
        "filter": [
          "all",
          [
            "in",
            "class",
            "motorway"
          ],
          [
            "==",
            "$type",
            "LineString"
          ]
        ],
        "layout": {
          "visibility": "none",
          "line-cap": "butt",
          "line-join": "round"
        },
        "paint": {
          "line-color": "rgba(20, 20, 20, 1)",
          "line-width": {
            "stops": [
              [
                7,
                1
              ],
              [
                9,
                2
              ],
              [
                14,
                3
              ]
            ]
          }
        }
      },
      {
        "id": "road-name",
        "type": "symbol",
        "source": "openmaptiles",
        "source-layer": "transportation_name",
        "minzoom": 10,
        "maxzoom": 24,
        "filter": [
          "all",
          [
            "==",
            "class",
            "motorway"
          ],
          [
            "==",
            "$type",
            "LineString"
          ]
        ],
        "layout": {
          "visibility": "none",
          "text-field": "{ref}",
          "text-font": [
            "Roboto Bold",
            "Klokantech Noto Sans Regular"
          ],
          "text-size": 14,
          "text-anchor": "center",
          "text-allow-overlap": false,
          "text-ignore-placement": false,
          "symbol-placement": "line"
        },
        "paint": {
          "text-color": "rgba(0, 0, 0, 1)",
          "text-halo-width": 0.5,
          "text-halo-color": "rgba(0, 0, 0, 1)",
          "text-translate-anchor": "map"
        }
      },
      {
        "id": "place_village",
        "type": "symbol",
        "metadata": {
          "mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"
        },
        "source": "openmaptiles",
        "source-layer": "place",
        "minzoom": 13,
        "maxzoom": 15,
        "filter": [
          "all",
          [
            "==",
            "$type",
            "Point"
          ],
          [
            "in",
            "class",
            "village",
            "hamlet"
          ]
        ],
        "layout": {
          "text-size": 16,
          "icon-image": {
            "base": 1,
            "stops": [
              [
                0,
                "circle-11"
              ],
              [
                22,
                ""
              ]
            ]
          },
          "text-font": [
            "Roboto Bold",
            "Klokantech Noto Sans Regular",
            "Klokantech Noto Sans CJK Regular"
          ],
          "text-justify": "center",
          "visibility": "none",
          "text-offset": [
            0,
            0
          ],
          "icon-size": 0,
          "text-anchor": "center",
          "text-field": "{name}",
          "symbol-avoid-edges": false,
          "text-allow-overlap": false,
          "text-ignore-placement": false
        },
        "paint": {
          "text-color": "rgba(255, 255, 255, 1)",
          "text-halo-color": "rgba(0, 0, 0, 1)",
          "text-halo-width": 0.2,
          "text-halo-blur": 0.5,
          "icon-opacity": 1,
          "icon-halo-color": "rgba(0, 0, 0, 1)",
          "icon-color": "rgba(255, 0, 0, 1)"
        }
      },
      {
        "id": "place_town",
        "type": "symbol",
        "metadata": {
          "mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"
        },
        "source": "openmaptiles",
        "source-layer": "place",
        "minzoom": 10,
        "maxzoom": 15,
        "filter": [
          "all",
          [
            "==",
            "$type",
            "Point"
          ],
          [
            "==",
            "class",
            "town"
          ]
        ],
        "layout": {
          "text-size": 16,
          "icon-image": {
            "base": 1,
            "stops": [
              [
                0,
                "circle-11"
              ],
              [
                22,
                ""
              ]
            ]
          },
          "text-font": [
            "Roboto Bold",
            "Klokantech Noto Sans Regular",
            "Klokantech Noto Sans CJK Regular"
          ],
          "text-justify": "center",
          "visibility": "visible",
          "text-offset": [
            0,
            0
          ],
          "icon-size": 0,
          "text-anchor": "center",
          "text-field": "{name}",
          "symbol-avoid-edges": false,
          "text-allow-overlap": false
        },
        "paint": {
          "text-color": "rgba(0, 0, 0, 0.87)",
          "text-halo-color": "rgba(255, 255, 255, 1)",
          "text-halo-width": 0.2,
          "text-halo-blur": 0.5,
          "icon-opacity": 1,
          "icon-halo-color": "rgba(0, 0, 0, 1)",
          "icon-color": "rgba(255, 0, 0, 1)"
        }
      },
      {
        "id": "place_city",
        "type": "symbol",
        "metadata": {
          "mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"
        },
        "source": "openmaptiles",
        "source-layer": "place",
        "minzoom": 6.5,
        "maxzoom": 14,
        "filter": [
          "all",
          [
            "==",
            "$type",
            "Point"
          ],
          [
            "all",
            [
              "!=",
              "capital",
              2
            ],
            [
              "==",
              "class",
              "city"
            ],
            [
              ">",
              "rank",
              3
            ]
          ]
        ],
        "layout": {
          "text-size": 18,
          "icon-image": "circle-11",
          "text-transform": "none",
          "text-font": [
            "Roboto Bold",
            "Klokantech Noto Sans Regular",
            "Klokantech Noto Sans CJK Regular"
          ],
          "text-justify": "center",
          "visibility": "visible",
          "text-offset": [
            0,
            -0.7
          ],
          "icon-size": 0.7,
          "text-anchor": "center",
          "text-field": "{name:latin}",
          "text-allow-overlap": false,
          "text-ignore-placement": false
        },
        "paint": {
          "text-color": "rgba(0, 0, 0, 0.87)",
          "text-halo-color": "rgba(255,255,255,1)",
          "text-halo-width": 0.2,
          "text-halo-blur": 0.5,
          "icon-opacity": 0.9,
          "icon-color": "rgba(255, 255, 255, 1)",
          "icon-halo-color": "rgba(226, 34, 34, 1)",
          "icon-halo-width": 10
        }
      },
      {
        "id": "place_capital",
        "type": "symbol",
        "metadata": {
          "mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"
        },
        "source": "openmaptiles",
        "source-layer": "place",
        "minzoom": 4.5,
        "maxzoom": 12,
        "filter": [
          "all",
          [
            "==",
            "$type",
            "Point"
          ],
          [
            "all",
            [
              "==",
              "capital",
              2
            ],
            [
              "==",
              "class",
              "city"
            ]
          ]
        ],
        "layout": {
          "text-size": 18,
          "icon-image": "star-11",
          "text-transform": "none",
          "text-font": [
            "Roboto Bold",
            "Klokantech Noto Sans Regular",
            "Klokantech Noto Sans CJK Regular"
          ],
          "text-justify": "left",
          "visibility": "visible",
          "text-offset": [
            0,
            -0.7
          ],
          "icon-size": 1,
          "text-anchor": "center",
          "text-field": "{name:latin}",
          "icon-text-fit": "none",
          "icon-allow-overlap": false,
          "icon-ignore-placement": false,
          "icon-optional": false
        },
        "paint": {
          "text-color": "rgba(0, 0, 0, 0.87)",
          "text-halo-color": "rgba(255, 255, 255, 1)",
          "text-halo-width": 0.5,
          "text-halo-blur": 0.12,
          "icon-color": "rgba(0,0,0,0.5)"
        }
      },
      {
        "id": "place_city_large",
        "type": "symbol",
        "metadata": {
          "mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"
        },
        "source": "openmaptiles",
        "source-layer": "place",
        "minzoom": 6,
        "maxzoom": 14,
        "filter": [
          "all",
          [
            "==",
            "$type",
            "Point"
          ],
          [
            "all",
            [
              "!=",
              "capital",
              2
            ],
            [
              "<=",
              "rank",
              3
            ],
            [
              "==",
              "class",
              "city"
            ]
          ]
        ],
        "layout": {
          "text-size": 18,
          "icon-image": {
            "base": 1,
            "stops": [
              [
                0,
                "circle-11"
              ],
              [
                8,
                ""
              ]
            ]
          },
          "text-transform": "none",
          "text-font": [
            "Roboto Bold",
            "Metropolis Bold",
            "Klokantech Noto Sans CJK Regular"
          ],
          "text-justify": "left",
          "visibility": "visible",
          "text-offset": [
            0,
            -0.7
          ],
          "icon-size": 0.9,
          "text-anchor": "center",
          "text-field": "{name_int}"
        },
        "paint": {
          "text-color": "rgba(255, 255, 255, 1)",
          "text-halo-color": "rgba(0, 0, 0, 1)",
          "text-halo-width": 0.2,
          "text-halo-blur": 0.5,
          "icon-opacity": 0.7
        }
      },
      {
        "id": "place_state",
        "type": "symbol",
        "metadata": {
          "mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"
        },
        "source": "openmaptiles",
        "source-layer": "place",
        "minzoom": 5,
        "maxzoom": 8,
        "filter": [
          "all",
          [
            "==",
            "$type",
            "Point"
          ],
          [
            "==",
            "class",
            "state"
          ],
          [
            "==",
            "rank",
            1
          ]
        ],
        "layout": {
          "visibility": "visible",
          "text-field": "{name_int}",
          "text-font": [
            "Roboto Bold",
            "Klokantech Noto Sans Regular",
            "Klokantech Noto Sans CJK Regular"
          ],
          "text-transform": "none",
          "text-size": {
            "stops": [
              [
                6,
                12
              ],
              [
                8,
                20
              ]
            ]
          }
        },
        "paint": {
          "text-color": "rgba(255, 255, 255, 1)",
          "text-halo-color": "rgba(0, 0, 0, 1)",
          "text-halo-width": 0.2,
          "text-halo-blur": 0.5
        }
      },
      {
        "id": "place_country_other",
        "type": "symbol",
        "metadata": {
          "mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"
        },
        "source": "openmaptiles",
        "source-layer": "place",
        "minzoom": 3,
        "maxzoom": 4.5,
        "filter": [
          "all",
          [
            "==",
            "$type",
            "Point"
          ],
          [
            "all",
            [
              "==",
              "class",
              "country"
            ],
            [
              ">=",
              "rank",
              2
            ]
          ]
        ],
        "layout": {
          "visibility": "visible",
          "text-field": "{name:en}",
          "text-font": [
            "Roboto Bold",
            "Klokantech Noto Sans Regular",
            "Klokantech Noto Sans CJK Regular"
          ],
          "text-transform": "none",
          "text-size": {
            "base": 1,
            "stops": [
              [
                0,
                10
              ],
              [
                6,
                12
              ]
            ]
          }
        },
        "paint": {
          "text-halo-width": 0.5,
          "text-color": "rgba(255, 255, 255, 1)",
          "text-halo-color": "rgba(0, 0, 0, 1)",
          "text-halo-blur": 0.5
        }
      },
      {
        "id": "place_country_major",
        "type": "symbol",
        "metadata": {
          "mapbox:group": "101da9f13b64a08fa4b6ac1168e89e5f"
        },
        "source": "openmaptiles",
        "source-layer": "place",
        "minzoom": 3,
        "maxzoom": 4.5,
        "filter": [
          "all",
          [
            "==",
            "$type",
            "Point"
          ],
          [
            "all",
            [
              "<=",
              "rank",
              1
            ],
            [
              "==",
              "class",
              "country"
            ]
          ]
        ],
        "layout": {
          "visibility": "visible",
          "text-field": "{name:en}",
          "text-font": [
            "Roboto Bold",
            "Klokantech Noto Sans Regular",
            "Klokantech Noto Sans CJK Regular"
          ],
          "text-transform": "none",
          "text-size": {
            "base": 1.4,
            "stops": [
              [
                0,
                10
              ],
              [
                3,
                12
              ],
              [
                4,
                14
              ]
            ]
          },
          "text-anchor": "center"
        },
        "paint": {
          "text-halo-width": 0.5,
          "text-color": "rgba(255, 255, 255, 1)",
          "text-halo-color": "rgba(0, 0, 0, 1)",
          "text-halo-blur": 0.5,
          "text-opacity": 1
        }
      },
      {
        "id": "national-parks",
        "type": "fill",
        "source": "openmaptiles",
        "source-layer": "park",
        "minzoom": 10,
        "filter": [
          "all",
          [
            "==",
            "class",
            "national_park"
          ]
        ],
        "layout": {
          "visibility": "none"
        },
        "paint": {
          "fill-color": "rgba(1, 94, 12, 0.25)",
          "fill-outline-color": "rgba(0, 0, 0, 1)",
          "fill-opacity": 0.4
        }
      },
      {
        "id": "national-parks-labels",
        "type": "symbol",
        "source": "openmaptiles",
        "source-layer": "park",
        "minzoom": 10,
        "filter": [
          "all",
          [
            "==",
            "class",
            "national_park"
          ]
        ],
        "layout": {
          "text-field": {
            "type": "identity",
            "property": "name"
          },
          "text-padding": 20,
          "visibility": "none"
        },
        "paint": {
          "text-halo-color": "rgba(255, 255, 255, 0.23)",
          "text-halo-width": 1,
          "text-halo-blur": 1
        }
      }
    ],
    "id": "imweather-sea",
    "owner": "timo-visser-infoplaza"
  }
