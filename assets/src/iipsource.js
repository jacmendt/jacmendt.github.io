/**
 * Created by mendt on 25.08.15.
 */
goog.provide('slub.IIPSource');

/**
 * @typedef {{url: string,
 *            width: number,
 *            height: number
 *            tileSize: (number|undefined) }}
 */
slub.IIPSourceOptions;

/**
 * @constructor
 * @extends {ol.source.TileImage}
 * @param {slub.IIPSourceOptions} opt_options
 */
slub.IIPSource = function(opt_options) {

    var options = goog.isDef(opt_options) ? opt_options : {},
        size = options.size,
        tierSizeInTiles = [],
        resolutions = [],
        tileSize = goog.isDef(options.tileSize) ? options.tileSize : ol.DEFAULT_TILE_SIZE,
        url = options.url;

    var imageWidth = size[0],
        imageHeight = size[1],
        res = 1;
    while (imageWidth > tileSize || imageHeight > tileSize) {

        tierSizeInTiles.push([
            Math.ceil(imageWidth / tileSize),
            Math.ceil(imageHeight / tileSize)
        ]);
        resolutions.push( res );

        imageWidth >>= 1;
        imageHeight >>= 1;
        res += res;

    };
    resolutions.push( res );
    tierSizeInTiles.push( [1,1]);

    resolutions.reverse();
    tierSizeInTiles.reverse();

    /**
     * @this {ol.source.TileImage}
     * @param {ol.TileCoord} tileCoord Tile Coordinate.
     * @param {number} pixelRatio Pixel ratio.
     * @param {ol.proj.Projection} projection Projection.
     * @return {string|undefined} Tile URL.
     */
    function tileUrlFunction(tileCoord, pixelRatio, projection) {
        if (goog.isNull(tileCoord)) {
            return undefined;
        } else {
            var resolution = tileCoord[0],
                tileCoordX = tileCoord[1],
                tileCoordY = -tileCoord[2] - 1,
                tileIndex = tileCoordY * tierSizeInTiles[resolution][0] + tileCoordX;
            return url + '&JTL=' + resolution + ',' + tileIndex;
        }
    }

    var extent = [0, - size[1], size[0], 0];
    var tileGrid = new ol.tilegrid.TileGrid({
        extent: extent,
        origin: ol.extent.getTopLeft(extent),
        resolutions: resolutions
    });

    goog.base(this, {
        attributions: options.attributions,
        crossOrigin: options.crossOrigin,
        logo: options.logo,
        tileClass: ol.source.ZoomifyTile,
        tileGrid: tileGrid,
        tileUrlFunction: tileUrlFunction
    });

};
goog.inherits(slub.IIPSource, ol.source.TileImage);
