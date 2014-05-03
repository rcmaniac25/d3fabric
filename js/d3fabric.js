/*jslint nomen: true, plusplus: true */
/*global console, window*/

/**
 * Basix class definition and setup for usage.
 */
function d3Fabric(d3, fabric, gsap) {
    'use strict';

    if (!d3 || !fabric) { return; }
    function parseVersion(ver) {
        var res = {
            major: 0,
            minor: 0,
            build: 0,
            revision: 0
        },
            results;
        if (ver) {
            results = ver.split(".");
            res.major = results.length > 0 ? parseInt(results[0], 10) : 0;
            res.minor = results.length > 1 ? parseInt(results[1], 10) : 0;
            res.build = results.length > 2 ? parseInt(results[2], 10) : 0;
            res.revision = results.length > 3 ? parseInt(results[3], 10) : 0;
        }
        res.atLeast = function (major, minor, build, revision) {
            if (!major || res.major < major) {
                return false;
            }
            if (minor && res.minor < minor) {
                return false;
            }
            if (build && res.build < build) {
                return false;
            }
            if (revision && res.revision < revision) {
                return false;
            }
            return true;
        };
        return res;
    }
    if (!parseVersion(d3.version).atLeast(3, 4)) {
        console.error("Unsupported d3.js version. Need at least 3.4.0 or higher");
        return;
    }
    if (!parseVersion(fabric.version).atLeast(1, 4, 2)) {
        console.error("Unsupported FabricJS version. Need at least 1.4.2 or higher");
        return;
    }
    if (d3.fabric) {
        return;
    }

    /*
     * Add d3Fabric to d3.
     *
     * We save one instance because d3Fabric modifies d3 and fabric's prototypes, while
     * saving the original. We don't need to make this overcomplicated (though it probably
     * isn't proper...) and have copies of the "original" function, which is actually the
     * same function that will be replacing it because it was setup already.
     */
    d3.fabric = d3Fabric;

    d3Fabric.version = "1.0.0";
    d3Fabric.__internal__ = {
        d3: d3,
        fabric: fabric,

        gsap: gsap,
        d3_fabric_use_GSAP: gsap && parseVersion(gsap.version).atLeast(1, 11)
    };
}