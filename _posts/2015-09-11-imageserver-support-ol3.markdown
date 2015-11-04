---
layout: post
title:  "Support of selected imageserver protocols in OpenLayers 3"
date:   2015-09-11 14:07:26
categories: openlayers
custom_css_posts: 2015-09-11-imageserver-support-ol3
custom_js_lib:
- jquery
- ol-debug
- iiifgrid
- iiifsource
custom_js:
- iipsource
---
[OpenLayers 3](http://openlayers.org/) is a great library. It is mainly used for the creating of web mapping applications and thereby does a great job. Beside that it could also be used as a frontend library for multiple imageserver protocols. The following demos shows the support of the Zoomify-Protocol, the Internet Image Protocol, the Web Map Service Protocol and the International Image Interoperabilitiy Framework Protocol.


<div class="parent-map-container">	
	<div class="layerswitcher">
		<fieldset id="layerswitcher">
        	<input type="radio" id="zoomify" name="zoomify" value="zoomify"><label for="zoomify">Zoomify</label>
            <input type="radio" id="wms" name="wms" value="wms"><label for="wms">WMS</label>
            <input type="radio" id="iip" name="iip" value="iip"><label for="iip">Internet Imaging Protokolls</label>
            <input type="radio" id="iiif" name="iiif" value="iiif"><label for="iiif">International Image Interoperability Framework</label>
        </fieldset>
    </div>
    <div id="map"></div>
</div>

<script src='/src/posts/2015-09-11-imageserver-support-ol3.js' type="text/javascript"></script>
<script>  
	$('#zoomify').click();
</script>

To see how this is done have a look at the <a href="/src/posts/2015-09-11-imageserver-support-ol3.js">code</a>.
