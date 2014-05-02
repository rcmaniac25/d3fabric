/**
 * Setup for selection
 */
(function (d3Fabric, d3fInternal) {
	if (!d3fInternal.d3_fabric_selection_proto) {
        d3Fabric.selection = d3fInternal.d3_fabric_selection_proto = {};
        d3Fabric.selection_enter = d3fInternal.d3_fabric_selectionEnter_proto = {};
	}
})(d3Fabric, d3Fabric.__internal__);