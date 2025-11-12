"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prompt = void 0;
const availability_1 = require("./util/availability");
function prompt(feature, options, fn, isAvailable) {
    const isAvailableFunc = isAvailable || (0, availability_1.getDefaultFeatureAvailabilityCheck)(feature);
    return {
        mcp: options,
        fn,
        isAvailable: isAvailableFunc,
    };
}
exports.prompt = prompt;
