/**
 * Created by mendt on 04.11.15.
 */
// first check if webgl is enabled
var _canvas = document.createElement('canvas'),
	_gl = _canvas.getContext("webgl") || _canvas.getContext("experimental-webgl");
if( !_gl ) {
	alert("Couldn't get WebGL context");
}

if (_gl) {
	// initialize map
	var layer =  new ol.layer.Tile({
		source: new ol.source.OSM()
	});

	var map = new ol.Map({
		layers: [ layer ],
		renderer: 'webgl',
		target: 'map',
		view: new ol.View({
			center: [0, 0],
			zoom: 2
		})
	});

	var filterUpdate = false,
		filters = {
			brownie: false,
			desaturateLuminance: false,
			kodachrome: false,
			negative: false,
			polaroid: false,
			sepia: false,
			shiftToBGR: false,
			technicolor: false,
			vintagePinhole: false
		},
		filters1 = {
			contrast: 1,
			saturation: 0,
			brightness: 1,
			hue: 0
		};

	layer.on('postcompose', function(evt) {
		var webglContext = evt['glContext'],
				canvas = $('#map canvas')[0];
		if (webglContext !== undefined && webglContext !== null) {
			var gl = webglContext.getGL();

			if (!filterUpdate) {
				glif.reset();

				for (var filter in filters) {
					if (filters[filter] === true)
						glif.addFilter(filter);
				};

				for (var filter in filters1) {
					glif.addFilter(filter, filters1[filter]);
				};

				filterUpdate = true;
			}

			glif.apply(gl, canvas);

			// for showing openlayers that the program changed
			// if missing openlayers will produce errors because it
			// expected other shaders in the webgl program
			webglContext.useProgram(undefined);
		}
	});

	var updateFilter = function(paramKey, value) {
		filters[paramKey] = value;
		filterUpdate = false;
		layer.changed();
	};

	$('#brownie').click(function(event) { updateFilter('brownie', event.target.checked); });
	$('#desaturateLuminance').click(function(event) { updateFilter('desaturateLuminance', event.target.checked); });
	$('#kodachrome').click(function(event) { updateFilter('kodachrome', event.target.checked); });
	$('#negative').click(function(event) { updateFilter('negative', event.target.checked); });
	$('#polaroid').click(function(event) { updateFilter('polaroid', event.target.checked); });
	$('#sepia').click(function(event) { updateFilter('sepia', event.target.checked); });
	$('#shiftToBGR').click(function(event) { updateFilter('shiftToBGR', event.target.checked); });
	$('#technicolor').click(function(event) { updateFilter('technicolor', event.target.checked); });
	$('#vintagePinhole').click(function(event) { updateFilter('vintagePinhole', event.target.checked); });

	var createSlider = function(id, min, max, steps) {
		var sliderId = '#slider-' + id,
			feedbackId = '#value-' + id;

		// initialize emboss slider
		$(sliderId).slider({
			range: 'min',
			min: min,
			max: max,
			step: steps,
			value: filters1[id],
			slide: function(event, ui) {
				$(feedbackId).val(ui.value);

				// update the filter
				filters1[id] = ui.value;
				filterUpdate = false;
				layer.changed();
			}
		});
		$(feedbackId).val($(sliderId).slider('value'));
	};

	// create the sliders
	createSlider('contrast', 0, 2, 0.1);
	createSlider('saturation', -1, 1, 0.1);
	createSlider('brightness', 0, 2, 0.1);
	createSlider('hue', -500, 500, 1);
};
