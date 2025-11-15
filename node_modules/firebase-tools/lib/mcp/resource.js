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
exports.resourceTemplate = exports.resource = void 0;
function resource(options, fnOrText) {
    const fn = typeof fnOrText === "string"
        ? async (uri) => ({ contents: [{ uri, text: fnOrText }] })
        : fnOrText;
    return { mcp: options, fn };
}
exports.resource = resource;
function resourceTemplate(options, fnOrText) {
    let matchFn;
    const { match } = options, mcp = __rest(options, ["match"]);
    if (match instanceof RegExp) {
        matchFn = (uri) => match.test(uri);
    }
    else if (typeof match === "string") {
        matchFn = (uri) => uri.startsWith(match);
    }
    else {
        matchFn = match;
    }
    const fn = typeof fnOrText === "string"
        ? async (uri) => ({ contents: [{ uri, text: fnOrText }] })
        : fnOrText;
    return { mcp, match: matchFn, fn };
}
exports.resourceTemplate = resourceTemplate;
