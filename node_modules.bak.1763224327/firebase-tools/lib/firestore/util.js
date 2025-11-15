"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentMinuteAsIsoString = exports.booleanXOR = exports.parseFieldName = exports.parseIndexName = exports.parseDatabaseName = void 0;
const error_1 = require("../error");
const DATABASE_NAME_REGEX = /projects\/([^\/]+?)\/databases\/([^\/]+)/;
const INDEX_NAME_REGEX = /projects\/([^\/]+?)\/databases\/([^\/]+?)\/collectionGroups\/([^\/]+?)\/indexes\/([^\/]*)/;
const FIELD_NAME_REGEX = /projects\/([^\/]+?)\/databases\/([^\/]+?)\/collectionGroups\/([^\/]+?)\/fields\/([^\/]*)/;
function parseDatabaseName(name) {
    if (!name) {
        throw new error_1.FirebaseError(`Cannot parse undefined database name.`);
    }
    const m = name.match(DATABASE_NAME_REGEX);
    if (!m || m.length < 3) {
        throw new error_1.FirebaseError(`Error parsing database name: ${name}`);
    }
    return {
        projectId: m[1],
        databaseId: m[2],
    };
}
exports.parseDatabaseName = parseDatabaseName;
function parseIndexName(name) {
    if (!name) {
        throw new error_1.FirebaseError(`Cannot parse undefined index name.`);
    }
    const m = name.match(INDEX_NAME_REGEX);
    if (!m || m.length < 5) {
        throw new error_1.FirebaseError(`Error parsing index name: ${name}`);
    }
    return {
        projectId: m[1],
        databaseId: m[2],
        collectionGroupId: m[3],
        indexId: m[4],
    };
}
exports.parseIndexName = parseIndexName;
function parseFieldName(name) {
    const m = name.match(FIELD_NAME_REGEX);
    if (!m || m.length < 4) {
        throw new error_1.FirebaseError(`Error parsing field name: ${name}`);
    }
    return {
        projectId: m[1],
        databaseId: m[2],
        collectionGroupId: m[3],
        fieldPath: m[4],
    };
}
exports.parseFieldName = parseFieldName;
function booleanXOR(a, b) {
    return !!(Number(a) - Number(b));
}
exports.booleanXOR = booleanXOR;
function getCurrentMinuteAsIsoString() {
    const mostRecentTimestamp = new Date(Date.now());
    mostRecentTimestamp.setSeconds(0, 0);
    return mostRecentTimestamp.toISOString();
}
exports.getCurrentMinuteAsIsoString = getCurrentMinuteAsIsoString;
