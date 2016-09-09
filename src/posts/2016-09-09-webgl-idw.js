/**
 * GLOBAL PARAMETERS
 */
window['ANIMATION_STATUS'] = 0;
window['TIMESLICE_INDEX'] = 0;
window['ACTIVE_PHEN'] = '';
window['IDW_PROGRAM'] = {
    type: '',
    canvas: undefined,
    program: undefined,
    measurements: [],
    measurementsCount: 0,
    featureCount: 0,
    timeslices:[''],
    pixelToCoordinateMatrix: []
};

/**
 * Adds animation behavior to the application
 *
 * @param {ol.Map}
 * @param {string} btnPlayId
 * @param {string} btnPauseId
 * @param {string} btnStopId
 */
var addAnimationBehavior = function(map, btnPlayId, btnPauseId, btnStopId) {

    var invokeFn,
        animationLoop = function() {
        if (window['TIMESLICE_INDEX'] + 1 < window['IDW_PROGRAM'].timeslices.length) {
            window['TIMESLICE_INDEX'] += 1;

            if (window['ANIMATION_STATUS'] !== 0) {
                invokeFn = setTimeout(animationLoop, 2000);
            }

            map.dispatchEvent({
                type: 'moveend'
            });
        }
    }, invokeFn;

    $('#' + btnPlayId).click(function() {

        if (window['IDW_PROGRAM'].program !== undefined) {
            window['ANIMATION_STATUS'] = 1;
            setTimeout(animationLoop, 1000);
        } else {
            alert('No IDW program is loaded yet.')
        }

    });

    $('#' + btnPauseId).click(function() {

        if (window['IDW_PROGRAM'].program !== undefined) {
            window['ANIMATION_STATUS'] = 0;
            clearTimeout(invokeFn);
        } else {
            alert('No IDW program is loaded yet.')
        }

    });

    $('#' + btnStopId).click(function() {

        if (window['IDW_PROGRAM'].program !== undefined) {
            clearTimeout(invokeFn);
            window['ANIMATION_STATUS'] = 0;
            window['TIMESLICE_INDEX'] = 0;

            map.dispatchEvent({
                type: 'moveend'
            });
        } else {
            alert('No IDW program is loaded yet.')
        }

    });


};

/**
 * The function addes the idw behavior to a given map
 *
 * @param {ol.Map} map
 * @param {Object{ features: Array.<ol.Feature>, timeseries: Array.<string>, max: number, min: number, icon: string,
  *     iconScale: number, name: string }} dataset
 */
var addIDWBehavior = function(map, dataset) {

    var canvas;
    if (window['IDW_PROGRAM'].canvas === undefined) {
    	console.log(map.getSize())
        canvas = magl.olhelper.addOverlayCanvas(map);
    } else {
        canvas = window['IDW_PROGRAM'].canvas;
    }

    // reset global idw program
    window['IDW_PROGRAM'] = {
        type: dataset.name,
        canvas: canvas,
        program: undefined,
        measurements: [],
        measurementsCount: dataset.features[0].get('measurements').length,
        featureCount: dataset.features.length,
        timeslices: dataset.timeseries,
        pixelToCoordinateMatrix: window['IDW_PROGRAM'].pixelToCoordinateMatrix
    };

    // reset timeslices
    window['TIMESLICE_INDEX'] = 0;

    // push all measurements into one array as [x,y,z,v] structure
    var measurements = [],
        features = dataset.features;
    for (var i = 0; i < features.length; i++) {
        var coordinates = ol.proj.transform(features[i].getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326'),
            height = features[i].get('height');

        features[i].get('measurements').forEach(function(value) {
            measurements.push([coordinates[0], coordinates[1], height, value]);
        })
    }

    // normalize the data
    measurements = measurements.map(function(record) {
        if (record[3] != -9999.0) {
            record[3] = record[3] / (dataset.max - dataset.min);
        }
        return record;
    });

    window['IDW_PROGRAM'].measurements = measurements;

    map.dispatchEvent({
        type: 'moveend'
    });
};

/**
 * Id of the data record container
 *
 * @param {string} dataRecordContainerId
 * @param {ol.Map} map
 */
var addDataChooser = function(dataRecordContainerId, map) {

    var RECORDS = {
        steam_pressure: {
            name: 'Steam pressure',
            src: '/assets/data/DAMPFDRUCK_january.csv',
            icon: '/assets/images/cloud.png',
            iconClass: 'ion-ios-cloud',
            iconScale: 0.03
        },
        sunshine_duration: {
            name: 'Sunshine duration',
            src: '/assets/data/SONNENSCHEINDAUER_january.csv',
            icon: '/assets/images/ios7-sunny.png',
            iconClass: 'ion-ios-sunny',
            iconScale: 0.05
        },
        snow_depth: {
            name: 'Snow depth',
            src: '/assets/data/SCHNEEHOEHE_january.csv',
            icon: '/assets/images/ios7-snowy.png',
            iconClass: 'ion-ios-snow',
            iconScale: 0.05
        },
        air_temperature: {
            name: 'Air temperature',
            src: '/assets/data/LUFTTEMPERATUR_january.csv',
            icon: '/assets/images/thermometer.png',
            iconClass: 'ion-ios-thermometer',
            iconScale: 0.05
        },
        relative_humidity: {
            name: 'Realtive humidity',
            src: '/assets/data/REL_FEUCHTE_january.csv',
            icon: '/assets/images/waterdrop.png',
            iconClass: 'ion-ios-water',
            iconScale: 0.03
        }
    }

    var parentEl = $('#' + dataRecordContainerId),
        className = 'data-record';

    // add the legend elements to the map
    for (var key in RECORDS) {
        var record = RECORDS[key],
            html = '<a href="#" class="list-group-item ' + className + '" id="' + key + '">' +
                '<span class="icon ' + record.iconClass + '" data-pack="ios"></span>' +
                '<span class="name">  ' + record.name + '</span>' +
                '</a>'
        parentEl.append(html);
    };

    //
    // add behavior to the legend
    //
    var DATASET_CACHE = {};

    $('#' + dataRecordContainerId + ' .' + className).click(function(event) {
        // toggle active class
        $('#' + dataRecordContainerId + ' .' + className).removeClass('list-group-item-info');
        $(event.currentTarget).addClass('list-group-item-info');

        // Check if features have been already parsed
        var key = event.currentTarget.id;

        if (!(key in DATASET_CACHE)) {

            // load and parse the features
            $.ajax({
                url: RECORDS[key].src
            }).done(function(data) {
                DATASET_CACHE[key] = parseDatasetFromCsv(data, map.getView().getProjection().getCode());
                DATASET_CACHE[key].icon = RECORDS[key].icon;
                DATASET_CACHE[key].iconScale = RECORDS[key].iconScale;
                DATASET_CACHE[key].name = RECORDS[key].name;

                // add dataset to map and add behavior
                addDatasetToMap(map, DATASET_CACHE[key]);
            });

        } else {

            addDatasetToMap(map, DATASET_CACHE[key]);

        }

    });


    // on start up simulate click on first item
    $('#steam_pressure').trigger('click');
};


/**
 * Adds a given dataset to a map
 *
 * @param {ol.Map} map
 * @param {Object{ features: Array.<ol.Feature>, headings: Array.<string>, max: number, min: number, icon: string,
  *     iconScale: number, name: string }} dataset
 */
var addDatasetToMap = function(map, dataset) {

    var vectorLayer;

    map.getLayers().forEach(function(layer) {
        if (layer instanceof ol.layer.Vector)
            vectorLayer = layer;
    });

    if (vectorLayer === undefined)
        return;

    //
    // Generate style of the features
    //
    dataset.features.forEach(function(feature) {
        feature.set('style', createStyle(dataset.icon, undefined, dataset.iconScale));
    });

    //
    // Add data to vector source
    //
    vectorLayer.getSource().clear();
    vectorLayer.getSource().addFeatures(dataset.features);

    // Workaround so that other applications can see which phenomenen is actually displayed
    window['ACTIVE_PHEN'] = dataset.name;

    // add idw overlay
    addIDWBehavior(map, dataset);

};

/**
 * Functions creates a style based on a given svg.
 *
 * @param {string} src
 * @param {HTMLImageElement} img
 * @param {number} scale
 * @return {ol.style.Style}
 */
var createStyle = function(src, img, scale) {

    return new ol.style.Style({
        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
            src: src,
            img: img,
            imgSize: img ? [img.width, img.height] : undefined,
            scale: scale
        }))
    });
};

/**
 * This function loads the basic map
 *
 * @param {string} mapId
 * @return {ol.Map}
 */
var loadMapObj = function(mapId) {

    //
    // create map
    //
    map = new ol.Map({
        target: mapId,
        controls: [
            new ol.control.Zoom(),
            new ol.control.Attribution()
        ],
        layers: [
            new ol.layer.Tile({
                //source: new ol.source.OSM()
                source: new ol.source.XYZ({
                    attributions: ['Map data &copy; <a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox © OpenStreetMap</a>'],
                    url: 'https://api.tiles.mapbox.com/v4/jacmendt.n9i4n2f3/{z}/{x}/{y}.png?access_token=pk' +
                        '.eyJ1IjoiamFjbWVuZHQiLCJhIjoiZTYwNmU3YWU2YmI2YTIyODUyZWIyM2E2NTA1NmY0YTYifQ.yDQhDJ8foa7nIifwqo3GKQ'
                })
            }),
            new ol.layer.Vector({
                style: function(feature) {
                    return feature.get('style');
                },
                source: new ol.source.Vector({ features: [] })
            })
        ],
        view: new ol.View({
            center: ol.proj.transform([10.265896751187498, 51.32994657947656], 'EPSG:4326', 'EPSG:3857'),
            zoom: 6,
            projection: 'EPSG:3857'
        }),
        renderer: 'canvas'
    });

    //
    // Add hover behavior
    //
    var hoveredIcons = [];
    map.on('pointermove', function(evt) {

        // remove old hover styles
        map.getTargetElement().style.cursor = '';

        if (hoveredIcons.length > 0) {
            hoveredIcons.forEach(function(feature) {
                feature.set('style', createStyle(feature.get('style-src'), undefined, feature.get('style-scale')));
            });

            hoveredIcons = [];
        }

        // add new styles
        if (map.hasFeatureAtPixel(evt.pixel)) {
            map.getTargetElement().style.cursor = 'pointer';

            map.forEachFeatureAtPixel(evt.pixel, function(feature) {
                feature.set('style-scale', feature.get('style').getImage().getScale());
                feature.set('style-src', feature.get('style').getImage().getSrc());
                feature.set('style', createStyle(feature.get('style-src'), undefined, feature.get('style-scale') * 2));
                hoveredIcons.push(feature);
            })

        }

    });

    //
    // Add popup behavior
    //
    var popupId = 'data-popup';

    // if a popup container already exist remove it
    // $('#' + popupId).remove();
    // map.getOverlays().forEach(function(overlay) {
    //     map.removeOverlay(overlay);
    // });

    // create new popup
    $(map.getTargetElement()).append('<div class="' + popupId + '" id="' + popupId + '"></div>')

    var popup = new ol.Overlay({
        element: document.getElementById(popupId)
    })
    map.addOverlay(popup);

    // add click popup behavior
    map.on('click', function(event) {
        var element = popup.getElement(),
            coordinate = event.coordinate,
            hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
                coordinate, 'EPSG:3857', 'EPSG:4326'));

        $(element).popover('destroy');
        popup.setPosition(coordinate);

        // create popup content
        var content = '';

        // add station information
        if (map.hasFeatureAtPixel(event.pixel)) {
            map.forEachFeatureAtPixel(event.pixel, function(feature) {
                content += '<div><p>Station: ' + feature.get('name') + '</p><p> Daily value: ' + feature.get('measurements')[window['TIMESLICE_INDEX']] + '</p></div>'
            });
        } else {
            content += '<div><p>No station was clicked</p></div>';
        }

        // add idw information
        //content += '</div><p>IDW-Value: ...</p></div>';

        // the keys are quoted to prevent renaming in ADVANCED mode.
        $(element).popover({
            'placement': 'top',
            'animation': false,
            'html': true,
            'title':  window['ACTIVE_PHEN'],
            'content': content
        });

        $(element).popover('show');

        // add close button to popover title
        $('.popover-title').append('<button id="popover-close" type="button" class="close">&times;</button>');

        $('#popover-close').click(function(event) {
            $(element).popover('hide');
        });

    });

    /**
     * Update the pixelToCoordinate matrix
     */
    map.on('postcompose', function(event) {
        window['IDW_PROGRAM'].pixelToCoordinateMatrix = event.frameState.pixelToCoordinateMatrix;
    });

    //
    // Add idw layer
    //
    map.on('moveend', function() {

        if (window['IDW_PROGRAM'].measurements.length > 0) {

            console.log('Redraw IDW - Interpolation ...');

            var gl = magl.utils.loadGLContext(window['IDW_PROGRAM'].canvas);

            // init idw program
            if (window['IDW_PROGRAM'].program === undefined) {

                // initialize the idw program
                window['IDW_PROGRAM'].program = new magl.program.IDWProgram(gl, 'byte', 'EPSG:3857');
                window['IDW_PROGRAM'].program.render(window['IDW_PROGRAM'].measurements, window['IDW_PROGRAM'].measurementsCount,
                    window['IDW_PROGRAM'].featureCount, window['TIMESLICE_INDEX'], window['IDW_PROGRAM'].pixelToCoordinateMatrix);
            } else {
                window['IDW_PROGRAM'].program.update(window['TIMESLICE_INDEX'], window['IDW_PROGRAM'].pixelToCoordinateMatrix);
            }

            // update timeslices and feature count info
            $('#actual-timeslice').html(window['IDW_PROGRAM'].timeslices[window['TIMESLICE_INDEX']]);
            $('#feature-count').html(window['IDW_PROGRAM'].featureCount + ' stations');
        }

    });

		map.on('change:size', function(event) {
				if (window['IDW_PROGRAM'].canvas !== undefined) {
						$(window['IDW_PROGRAM'].canvas).remove();
						window['IDW_PROGRAM'].canvas = undefined;
				}

				if ($('.list-group-item-info')[0] !== undefined) {
						$('.list-group-item-info').trigger('click');
				} else {
						$('#steam_pressure').trigger('click');
				}
		});

    return map;
};

/**
 * Parse the given csv data to a ol.Feature collection.
 *
 * @param {string} csvDataString
 * @param {string} targetEPSG
 * @param {string} phenName
 * @return {Object{ features: Array.<ol.Feature>, headings: Array.<string>, max: number, min: number }}
 */
var parseDatasetFromCsv = function(csvDataString, targetEPSG) {

    console.log('Parse dwd air temperature data ...');

    var data = csvDataString.csvToArray({
        fSep: ';',
        rSep: '\n'
    });

    //
    // parse data
    //
    var response = {
        features: [],
        timeseries: [],
        min: undefined,
        max: undefined
    };

    // remove unnecessary headings (like coordinates, etc.) and slice them equal to timeseries data
    response.timeseries = data.splice(0, 1)[0];
    response.timeseries.splice(0, 5);


    //
    // parse the geo features
    //
    for (var i = 0; i < data.length; i++) {
        var record = data[i];

        var id = parseInt(record[0]),
            station_name = record[1],
            height = parseInt(record[2]),
            coordinate = targetEPSG === 'EPSG:3857'
                ? ol.proj.transform([parseFloat(record[4]), parseFloat(record[3])], 'EPSG:4326', 'EPSG:3857')
                : [parseFloat(record[4]), parseFloat(record[3])];

        record.splice(0, 5);

        //
        // parse measurements and get min-/max-values
        //

        // get min- / max- for single timeseries
        var measurements = [],
            min = parseFloat(record[0]),
            max = parseFloat(record[0]);
        record.forEach(function(v) {
            var value = isNaN(parseFloat(v)) ? -9999.0 : parseFloat(v);
            measurements.push(value)

            // check if initialize NaN
            if (isNaN(min) && value !== -9999.0) {
                min = value;
            }
            if (isNaN(max) && value !== -9999.0) {
                max = value;
            }

            // Never overwrite min with NaN
            if (value > -9999.0) {
                min = Math.min(min, value);
                max = Math.max(max, value);
            }
        });


        // update min-/max-values for hole dataset
        if (response.min === undefined && response.max === undefined) {
            response.min = min;
            response.max = max;
        } else if (!isNaN(min) && !isNaN(max)){
            response.min = Math.min(response.min, min);
            response.max = Math.max(response.max, max);
        }


        // create the geo features
        var feature = new ol.Feature({
            'geometry': new ol.geom.Point(coordinate),
            'height': height,
            'name': station_name,
            'min': min,
            'max': max,
            'measurements': measurements,
            'id': id
        });
        feature.setId(id);
        response.features.push(feature);
    }

    return response;
};
