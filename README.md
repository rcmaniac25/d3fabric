d3-Fabric
=====

d3.js is often used with SVG, but you want to use Canvas.

Luckily, d3-Fabric has a solution for you!

About / Background
=====

Enter [Eikos Partners](http://www.eikospartners.com/), who is developing a MVVM JavaScript framework
known as [ScaleJS](http://scalejs.com/).

See, the framework needs to work on desktop and mobile. Many of the applications developed are very
graphics heavy and often display many charts, graphs, and visualizations. One of the best, for Eikos's
needs, visualization libraries that was found was [d3.js](http://d3js.org/). These apps need to work on
desktop and mobile, which is makes sense until you find out that SVG is quite slow to work with on mobile.

What isn't slow? Canvas.

Can d3.js work with Canvas? Not in the way we hoped. It seemed like numerous requests for interop and
workarounds were developed. But it didn't let us to just say "append('rect')" and be done with it.

To avoid working directly with Canvas and it's low-level API, the decision to use [FabricJS](http://fabricjs.com/) was made.

The next challenge? Getting d3 to interact with Canvas, through FabricJS.

In early 2014, d3-Fabric was developed, so that d3 can be used but the results are written to a Canvas element.

Usage
=====

Requirements:
* d3.js 3.4.0 or higher
* FabricJS 1.4.2 or higher
* [Optional] GSAP 1.11 or higher

The simplist way to do this is to use d3-Fabric is to load d3js, FabricJS, and d3-Fabric, then to simply call:
```
d3Fabric(d3, fabric);
```

If you want to use the Green Sock Animation Platform (GSAP), then simply include that script, at least TweenLite,
and do the following instead:
```
d3Fabric(d3, fabric, TweenLite);
```

Usage from the example project to reproduce [Zoomable Treemap](http://mbostock.github.io/d3/talk/20111018/treemap.html):
```
var nodes = treemap.nodes(root)
    .filter(function (d) { return !d.children; });

var cell = canvasArea.selectAll("group")
    .data(nodes)
    .enter().append("group")
    .classed("cell", true)
    .attr("originX", "center")
    .attr("originY", "center")
    .attr("left", function (d) { return d.x; })
    .attr("top", function (d) { return d.y; })
    .on("mousedown", function(d) { return zoom(node == d.parent ? root : d.parent); });

cell.append("rect")
    .attr("width", function (d) { return Math.max(d.dx - 1, 0); })
    .attr("height", function (d) { return Math.max(d.dy - 1, 0); })
    .attr("fill", function(d) { return color(d.parent.name); });

cell.append("text")
    .attr("originX", "center")
    .attr("originY", "center")
    .attr("left", function (d) { return d.dx / 2; })
    .attr("top", function (d) { return d.dy / 2; })
    .attr("fontSize", 11)
    .text(function (d) { return d.name; })
    .attr("opacity", function (d) { d.w = this.getWidth(); return d.dx > d.w ? 1 : 0; });
```

Building
=====

To build the project, first install the dependencies.
```
$ npm install
$ npm install -g gulp
```
And then simply run:
```
$ gulp
[gulp] Using gulpfile Path/to/d3fabric/gulpfile.js
[gulp] Starting 'build'...
[gulp] Finished 'build' after 15 ms
[gulp] Starting 'default'...
[gulp] Finished 'default' after 12 μs
```
This will generate `d3fabric.min.js` in the `build/` directory.

To build the non-minifed version, call `gulp concat` instead.

Todo
=====

Lots. Mainly:

1. Make sure example is clickable.
2. Simplification of the `selection.attr` function.
3. Better input support (currently it "works" but not well, giving the appearence of not working at all)
4. Unit tests
5. API documentation
6. Performance improvements (see below)
7. Interop with other portions of d3
8. Support node.js

Performance
=====

So much.

The library, especially (TODO: write slow functions here) are quite slow or make things run quite slow. To be direct,
we currently don't Fabric because it was slower then we could use. This library was rewritten to do direct Canvas calls
as the performance benefits outweighed the extra boilerplate code.

If Fabric improves in performance, then it might be useful to move back to it. But that isn't my decision.

Performance tests done on frameworks:
* [Rect](http://jsperf.com/canvas-frameworks)
* [Circle](http://jsperf.com/canvas-frameworks-circle)
* [Path](http://jsperf.com/canvas-frameworks-path)
* [Text](http://jsperf.com/canvas-framework-text)
* [Image](http://jsperf.com/canvas-frameworks-image)

Contribute
====

All are welcome.

I am a noob when it comes to JavaScript, look at my other [repos](https://github.com/rcmaniac25?tab=repositories), most if not all are native code. Not web projects.
