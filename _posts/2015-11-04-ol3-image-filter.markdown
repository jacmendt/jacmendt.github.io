---
layout: post
title:  "WebGL image filter with ol3"
date:   2015-11-04 18:08:26
categories: openlayers
head_css:
- https://code.jquery.com/ui/1.11.3/themes/smoothness/jquery-ui.css
- https://cdnjs.cloudflare.com/ajax/libs/ol3/3.10.1/ol.css
- /css/posts/2015-11-04-ol3-image-filter.css
head_js:
- https://code.jquery.com/jquery-1.11.3.min.js
- https://code.jquery.com/ui/1.11.3/jquery-ui.min.js
- https://cdnjs.cloudflare.com/ajax/libs/ol3/3.10.1/ol.min.js
- /assets/lib/glif.min.js

---
The following post shows the usage of OpenLayers 3 together with the <a href="https://github.com/slub/webgl-image-filter">glif</a>
image filter library. To see how it function check the <a href="/src/posts/2015-11-04-ol3-image-filter.js">source</a>. The library
is based in big parts on the <a href="https://github.com/phoboslab/WebGLImageFilter">WebGLImageFilter</a> library by Dominic Szablewski
and offers multiple image filters. It can be easily couple with OpenLayers 3.

<section>
    <div id="map"></div>
</section>

<section>
    <h2>Filters without input:</h2>
    <form>
        <div class="checkbox">
            <label>
                <input type="checkbox" id="brownie">brownie
            </label>
        </div>
        <div class="checkbox">
            <label>
                <input type="checkbox" id="desaturateLuminance">desaturateLuminance
            </label>
        </div>
        <div class="checkbox">
            <label>
                <input type="checkbox" id="kodachrome">kodachrome
            </label>
        </div>
        <div class="checkbox">
            <label>
                <input type="checkbox" id="negative">negative
            </label>
        </div>
        <div class="checkbox">
            <label>
                <input type="checkbox" id="polaroid">polaroid
            </label>
        </div>
        <div class="checkbox">
            <label>
                <input type="checkbox" id="sepia">sepia
            </label>
        </div>
        <div class="checkbox">
            <label>
                <input type="checkbox" id="shiftToBGR">shiftToBGR
            </label>
        </div>
        <div class="checkbox">
            <label>
                <input type="checkbox" id="technicolor">technicolor
            </label>
        </div>
        <div class="checkbox">
            <label>
                <input type="checkbox" id="vintagePinhole">vintagePinhole
            </label>
        </div>
    </form>
<section>

<section>
    <h2>Filters with input:</h2>
        <div class="trigger">
            <p>
                <label for="value-contrast">contrast:</label>
                <input type="text" id="value-contrast" class="label-tooltip" readonly>
            </p>
            <div id="slider-contrast" class="slider"></div>
        </div>
        <div class="trigger">
            <p>
                <label for="value-saturation">saturation:</label>
                <input type="text" id="value-saturation" class="label-tooltip" readonly>
            </p>
            <div id="slider-saturation" class="slider"></div>
        </div>
        <div class="trigger">
            <p>
                <label for="value-brightness">brightness:</label>
                <input type="text" id="value-brightness" class="label-tooltip" readonly>
            </p>
            <div id="slider-brightness" class="slider"></div>
        </div>
        <div class="trigger">
            <p>
                <label for="value-hue">hue:</label>
                <input type="text" id="value-hue" class="label-tooltip" readonly>
            </p>
            <div id="slider-hue" class="slider"></div>
        </div>
</section>

<script src='/src/posts/2015-11-04-ol3-image-filter.js' type="text/javascript"></script>
