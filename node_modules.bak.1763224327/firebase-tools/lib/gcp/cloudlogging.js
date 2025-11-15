"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listEntries = void 0;
const api_1 = require("../api");
const apiv2_1 = require("../apiv2");
const error_1 = require("../error");
const API_VERSION = "v2";
async function listEntries(projectId, filter, pageSize, order, pageToken) {
    var _a;
    const client = new apiv2_1.Client({ urlPrefix: (0, api_1.cloudloggingOrigin)(), apiVersion: API_VERSION });
    const body = {
        resourceNames: [`projects/${projectId}`],
        filter,
        orderBy: `timestamp ${order}`,
        pageSize,
    };
    if (pageToken) {
        body.pageToken = pageToken;
    }
    try {
        const result = await client.post("/entries:list", body);
        return {
            entries: (_a = result.body.entries) !== null && _a !== void 0 ? _a : [],
            nextPageToken: result.body.nextPageToken,
        };
    }
    catch (err) {
        throw new error_1.FirebaseError("Failed to retrieve log entries from Google Cloud.", {
            original: err,
        });
    }
}
exports.listEntries = listEntries;
