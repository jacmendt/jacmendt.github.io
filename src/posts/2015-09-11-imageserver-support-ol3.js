// define zoomify params
        var zoomifyParams = {
                width: 11559,
                height: 9197,
                url: 'http://www.deutschefotothek.de/zoomify/df/zooms/df/dk/0011000/df_dk_0011468_0013/'
            },
            zoomifyCenter = [ zoomifyParams.width / 2 , - zoomifyParams.height / 2],
            zoomifyProj = new ol.proj.Projection({
                code: 'ZOOMIFY',
                units: 'pixels',
                extent: [ 0, 0, zoomifyParams.width, zoomifyParams.height ]
            }),
            zoomifyLayer = new ol.layer.Tile({
                source: new ol.source.Zoomify({
                    url: zoomifyParams.url,
                    size: [ zoomifyParams.width, zoomifyParams.height ]
                })
            });

        // define iip parameters
        var iipResolutions = [1, 2, 4, 8, 16, 32, 64],
            iipWidth = 18000,
            iipHeight = 18000;


        var layers = {
            zoomify: {
                layer: zoomifyLayer,
                view: new ol.View({
                    projection: zoomifyProj,
                    center: zoomifyCenter,
                    zoom: 0,
                    extent: [0, - zoomifyParams.height, zoomifyParams.width, 0]
                })
            },
            wms: {
                layer:   new ol.layer.Tile({
                    //extent: [-13884991, 2870341, -7455066, 6338219],
                    source: new ol.source.TileWMS({
                        url: 'http://demo.boundlessgeo.com/geoserver/wms',
                        params: {'LAYERS': 'topp:states'}
                    })
                }),
                view: new ol.View({
                    center: [-10997148, 4569099],
                    zoom: 4
                })
            },
            iiif: {
                layer: new ol.layer.Tile({
                    source: new klokantech.IiifSource({
                        baseUrl: 'http://iiif.klokantech.com/demo.jp2',
                        width: 7800,
                        height: 8300,
                        resolutions: [ 1, 2, 4, 8, 16, 32, 64 ],
                        extension: [ 'jpg' ],
                        tileSize: 256,
                        projection: new ol.proj.Projection({
                            code: 'IIIF',
                            units: 'pixels',
                            extent: [0, -8300, 7800, 0]
                        }),
                        crossOrigin: undefined
                    })
                }),
                view: new ol.View({
                    projection: new ol.proj.Projection({
                        code: 'IIIF',
                        units: 'pixels',
                        extent: [0, -8300, 7800, 0]
                    }),
                    center: [ 7800 / 2 , - 8300 / 2],
                    zoom: 0,
                    extent: [0, - 8300, 7800, 0]
                })
            },
            iip: {
                layer: new ol.layer.Tile({
                    source: new slub.IIPSource({
                        url: 'http://merovingio.c2rmf.cnrs.fr/fcgi-bin/iipsrv.fcgi?FIF=heic0601a.tif',
                        size: [ iipWidth, iipHeight ] ,
                        tileSize: 256
                    })
                }),
                view: new ol.View({
                    projection: new ol.proj.Projection({
                        code: 'IIP',
                        units: 'pixels',
                        extent: [0, -iipHeight, iipWidth, 0]
                    }),
                    center: [ iipWidth / 2 , - iipHeight / 2],
                    zoom: 0,
                    extent: [0, - iipHeight, iipWidth, 0]
                })
            }
        }
        
        var map = new ol.Map({
            layers: [ ],
            target: 'map',
            view: new ol.View({
                projection: zoomifyProj,
                center: zoomifyCenter,
                zoom: 0,
                extent: [0, - zoomifyParams.height, zoomifyParams.width, 0]
            })
        });

        // click handler for events for switching the layer
        $('#layerswitcher').click(function(event) {
            // deselect all radio buttons which are not clicked
            // and remove layers
            var radioBtns = $('#layerswitcher input');
            for ( var i = 0; i < radioBtns.length; i++) {
                var btn = radioBtns[i];
                if (btn.value !== event.target.value && btn.checked) {
                    btn.checked = false;
                };

                // remove layer if it there
                if (btn.value in layers) {
                    map.removeLayer(layers[btn.value].layer);
                };
            };

            // add layer if it exist
            if (event.target.value in layers) {
                map.setView(layers[event.target.value].view);
                map.addLayer(layers[event.target.value].layer);
            };
        });
