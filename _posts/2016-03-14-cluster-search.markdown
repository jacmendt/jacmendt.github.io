---
layout: post
title:  "The point cluster search problem"
date:   2016-03-14 13:00:00
categories:
- cluster-search
- gis
head_css:
- //code.jquery.com/ui/1.11.3/themes/smoothness/jquery-ui.css
- //cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.3/leaflet.css
- //cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/0.4.0/MarkerCluster.css
- //cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/0.4.0/MarkerCluster.Default.css
- /css/posts/2016-03-14-cluster-search.css
head_js:
- //code.jquery.com/jquery-1.11.3.min.js
- //code.jquery.com/ui/1.11.3/jquery-ui.min.js
- //cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.3/leaflet.js
- //cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/0.4.0/leaflet.markercluster.js

---
In the 2016, using and displaying large amounts (>10.000) of point data in web browsers shouldn't be a hard task. This was
what I thought when stumbling over this topic in one of my projects. But when I digged deeper into this topic I found out,
that there are still a lot of pitfalls and shortages when displaying large amounts of point data in web applications. The
 article therefor discusses problems as well as solutions for this issue. It is a collection of insights and
 ideas regarding this topics and also when the examples are mainly using tools like <a href="http://leafletjs.com/">Leaflet</a>
 and <a href="https://www.elastic.co">ElasticSearch</a> the assertions are widely the same for other tools.

<section>
    <h2>The story</h2>
    <p>
        I stumbled over this topic when I was developing a web-based map search application for a sensor project. In the project, we had something
        around 300.000 sensors distributed over the hole world. Our goal was to develop a map based search application, which allows
        a user to pan through a map and search for sensors in it.
    </p>
    <p>
        We were already familiar with developing web-based map search applications, so we set up an <a href="https://www.elastic.co">
        ElasticSearch</a>, pushed our sensor data in it and build an simple <a href="http://leafletjs.com/">Leaflet</a> application
        on top of it. And in simply terms, this was the result:
    </p>
    <div id="map-to-much-points" class="map"></div>
    <p>
        The hole workflow wasn't to hard to implement, but it leads us directly to the first problem, when displaying large
         amounts of point data on top of a map. The <b>Marker-/Point-Problem</b>. It is a simple information overload. I mean,
         who needs 2.000 markers on the screen. Probably the only thinkable use case is, that you wanna impress somebody with
         your amount of data.
    </p>
    <p>
        The normal way to solve this problem is to use Aggregation resp. Clusters. In the <a href="http://leafletjs.com/">Leaflet</a>
        universe, you can therefor use the popular <a href="https://github.com/Leaflet/Leaflet.markercluster">Leaflet.markercluster</a>
        plugin.
    </p>
    <div id="map-cluster-points" class="map"></div>
    <p>
        It performance a client-side clustering of your data and has a couple of nice to have features, like spidering and
        animated clusters. Spidering means that when you click on a cluster on a higher zoom level it expands like a spiderweb and
        presents you the actually point data. Animation means that the dissolution and aggregation of the clusters is accompanied
        by a smooth transition of the cluster points. For displaying clusters on top of maps there are of course more approaches.
        An extensive overview about them is given in the article <a href="http://blog.cartodb.com/stacking-chips-a-map-hack/">
        "Stacking Chips - Showing Many Points that Share the Same Location"</a> by @cartodb.
    </p>
</section>

<section>
    <h2>Clustering the shortages</h2>
    <p>
        For a lot of applications the described approaches above would already be enough. In our case it wasn't, which was
        also the reason why I wrote this article.
    </p>
    <h3>To much traffic</h3>
    <p>
        The first problem pertains the amount of data transferred through the network. For the examples viewed above, I
        used a data record comprising 2.000 sensors. The records only contain the sensor <i>location</i> plus some further
        information like <i>type</i> or <i>id</i>. This is not much information, but it already results in a file size
        around 500 KB. Now imaging we had to push all our 300.000 sensor records to the client. This would mean we had to push
        something around 70 MB through the wire, what is definitely to much.
    <img src="/assets/images/sensors_germany_2000-min.png" class="image" />
        At this point we realize, that client-side clustering isn't the perfect solution for our use case. But luckily, we use
         <a href="https://www.elastic.co">ElasticSearch</a>, which offers by default (<a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-geohashgrid-aggregation.html">GeoHash grid Aggregation</a>)
         and through third party plugins (<a href="https://github.com/triforkams/geohash-facet">Geohash Facet Plugin</a>,<a href="https://github.com/zenobase/geocluster-facet">Geo Cluster Facet Plugin</a>, etc.)
         some ways for performing server-side clustering. Server-side clustering gives us the opportunity, to fetch at lower
          zoom levels, only cluster- resp. aggregated-data, while we use on higher zoom levels the raw data. Through this
          approach we can drastically reduce the amount of data transferred through the network and rendered by the client.
    </p>

    <h3>Creating clusters</h3>
    <p>
        But the use of clusters leads us directly into the next trap, which I call the <b>Cluster-Pattern-Problem</b>.
        If you look closer at a response of a <a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-geohashgrid-aggregation.html">
        GeoHash grid Aggregation</a> requests, you recognize the grid pattern in the response data.
    </p>
    <img src="/assets/images/geohash_grid.jpeg" class="image" />
    <p>
        This is an unsatisfactorily solution. It doesn't give us a good impression about the real distribution of the
         sensor data, because it focus on the GeoHash grid structure instead on the data distribution pattern. An alternative
         could therefor be the using of weight based clustering algorithm. <a href="https://www.elastic.co">ElasticSearch</a>
         supports this through different plugins like <a href="https://github.com/triforkams/geohash-facet">Geohash Facet Plugin</a>
         or <a href="https://github.com/zenobase/geocluster-facet">Geo Cluster Facet Plugin</a>. But this leads us to the
         next problems, which I call the <b>Cluster Localization Problem</b> and the <b>Cluster Dissolution Problem</b> and
         which are described through the pictures below.
    <img src="/assets/images/cluster_zoom-min.png" class="image" />
    <p>
        The map on the left side shows us clusters which are placed in the middle of the pacific. It says that there are 903
        sensors in the Philippine Sea. Is that true? Of course not and there are also not only 2 sensors in Australia. But the
        relying on simple weight based algorithm leads us to this kind of localization problem. In simple words, the clusters can
        appear everywhere, regardless of whether it make sense or not.
    </p>
    <p>
        Further if we zoom out, the clusters from the left side dissolve to the clusters on the right side. Now we got
        23.028 sensors in Australia. This is completely counter intuitive and will for sure confuse every user of our application.
        It is due to the fact that in normal cluster algorithm there are no relations between the clusters of different zoom levels.
    </p>
    <p>
        I don't know the perfect solution yet. But what I think is worth a try, is the using of aggregation by administrative
        borders in lower zoom levels. At least this would lead to a more intuitive user experience. If using <a href="https://www.elastic.co">ElasticSearch</a>
        the challenge thereby is, to get a performant implementation of this approach up and running. Probably there are also
        other approaches worth a try. I will try to dig deeper into this topic and will let you know if I do some progress.
    </p>

    <h3>UI/UX when working with clusters</h3>
    <p>
        Imaging we have found a suitable solutions for producing good server-side clusters. The hard part should be done now and
        we only have to display the data yet, or?
    </p>
    <p>
        Yes and no. The truth is there are plenty of good mapping libraries out there, which made it easy to display your data
        on the map. But there is, from my point of view, also a gap for a better cluster visualization approach, which integrates the best
        features from different cluster visualization approaches. For example the
        <a href="https://github.com/Leaflet/Leaflet.markercluster">Leaflet.markercluster</a> plugin is simple to use and has a lot of
         nice to have features. But it's missing a opportunity for visualizing further cluster information,
         like the occurrence of different sensor types or phenomenons within the clusters. Other approaches, like the
         <a href="http://blog.cartodb.com/stacking-chips-a-map-hack/">"Stacking Chips"</a> implemenation from <a href="https://cartodb.com/">@cartodb</a>
         have this opportunity, but they doesn't scale for clusters with a high feature count as well as have their prices on touch
         devices.
    </p>
    <img src="/assets/images/stacking_chips.jpeg" class="image" />
    <p>
        So what I actually want on the client-side is a cluster layer, which supports the following list of features:
    </p>
    <ul>
        <li>Visualization of relations between cluster on different zoom levels (animation from transitions)</li>
        <li>Visualization of basic cluster information, like phenomenons within the cluster</li>
        <li>Support of desktop and mobil devices</li>
        <li>Fluent transition from cluster to raw data view</li>
        <li>There has to be something better than "Spidering"</li>
        <li>Using of client-side clustering in higher zoom and server-side clustering in lower zoom levels</li>
    </ul>
    <p>
        I will stick to this list and try to do some research to it in the near future.
    </p>
</section>

<section>
    <h2>Conclusion</h2>
    <p>
        The goal of this article was to give a small overview about shortages of spatial clustering approaches in the year 2016.
        A lot of work is already done and great open source tools like <a href="http://leafletjs.com/">Leaflet</a>, <a href="http://openlayers.org/">OpenLayers<a> or
        <a href="https://www.elastic.co">ElasticSearch</a> made the start of working with clusters quite easy. Nevertheless, from my point of view, there
        is still of lot of space to improve. Maybe this article can therefor be a starting point.
    </p>
    <p>
       If you have suggestions or other opinions to the issue, please leave a comment or contact me. In case you want to dig
       deeper into this topic you find some further insights to this topic behind the links below:
    </p>
    <ul>
        <li><a href="http://blog.davebouwman.com/2012/03/24/server-side-clustering-why-you-need-it/">
        Server Side Clustering: Why you need it</a></li>
        <li><a href="http://blog.trifork.com/2013/08/01/server-side-clustering-of-geo-points-on-a-map-using-elasticsearch/">
        Server Side Clustering of Geo-Points on a map using ElasticSearch</a></li>
        <li><a href="http://stackoverflow.com/questions/15906837/geospatial-marker-clustering-with-elasticsearch">
        StackOverflow: Geospatial marker clustering with elasticsearch</a></li>
        <li><a href="https://devmynd.com/blog/2014-2-geohash-grid-aggregation-with-elasticsearch/">
        GeoHash Grid Aggregation with ElasticSearch</a></li>
    </ul>
</section>


<script src='/src/posts/2016-03-14-cluster-search.js' type="text/javascript"></script>


