"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tool = void 0;
const zod_to_json_schema_1 = require("zod-to-json-schema");
const util_1 = require("./util");
const availability_1 = require("./util/availability");
function tool(feature, options, fn) {
    const { isAvailable } = options, mcpOptions = __rest(options, ["isAvailable"]);
    const isAvailableFunc = isAvailable || (0, availability_1.getDefaultFeatureAvailabilityCheck)(feature);
    return {
        mcp: Object.assign(Object.assign({}, mcpOptions), { inputSchema: (0, util_1.cleanSchema)((0, zod_to_json_schema_1.zodToJsonSchema)(options.inputSchema)) }),
        fn,
        isAvailable: isAvailableFunc,
    };
}
exports.tool = tool;
