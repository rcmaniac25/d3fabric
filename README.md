d3-Fabric
=====

d3.js uses SVG, but you want to use Canvas.

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

Can d3.js work with Canvas? Nope. A simple Google search will give you many "uses" of d3 with Canvas,
and requests 

To avoid working directly with Canvas and it's low-level API, the decision to use [FabricJS](http://fabricjs.com/) was made.

The next challenge? Getting d3 to interact with Canvas, through FabricJS.

This is where d3-Fabric was developed, so that d3 can be used but the results are written to a Canvas element.

Usage
=====

TODO

Usage from one project to reproduce [Zoomable Treemap](http://mbostock.github.io/d3/talk/20111018/treemap.html):
```
var nodes = treemap.nodes(root)
    .filter(function (d) { return !d.children; }),

    cell = fabricElement.data(nodes)
    .enter().append("group")
    .classed("cell", true)
    .attr("left", function (d) { return d.x; })
    .attr("top", function (d) { return d.y; })
    .on("selected", function (d) { return zoom(node === d.parent ? root : d.parent, true); });

cell.append("rect")
    .attr("width", function (d) { return d.dx - 1; })
    .attr("height", function (d) { return d.dy - 1; })
    .style("fill", function (d) { return color(d.parent.name); });

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

TODO

Todo
=====

Lots. Mainly:

1. Actually getting the library to be something other then a monolithic js file.
2. Simplification of the `selection.attr` function.
3. Examples
4. Unit tests
5. API documentation
6. Performance improvements (see below)

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

I am a noob when it comes to JavaScript, look at my [repos](https://github.com/rcmaniac25?tab=repositories), most if not all are native code. Not web projects.
