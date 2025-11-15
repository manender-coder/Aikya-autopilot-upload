"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_logs = void 0;
const zod_1 = require("zod");
const tool_1 = require("../../tool");
const util_1 = require("../../util");
const functionslog_1 = require("../../../functions/functionslog");
const cloudlogging_1 = require("../../../gcp/cloudlogging");
const error_1 = require("../../../error");
const SEVERITY_LEVELS = [
    "DEFAULT",
    "DEBUG",
    "INFO",
    "NOTICE",
    "WARNING",
    "ERROR",
    "CRITICAL",
    "ALERT",
    "EMERGENCY",
];
function normalizeFunctionSelectors(selectors) {
    if (!selectors)
        return undefined;
    if (Array.isArray(selectors)) {
        const cleaned = selectors.map((name) => name.trim()).filter(Boolean);
        return cleaned.length ? cleaned.join(",") : undefined;
    }
    const cleaned = selectors
        .split(/[,\s]+/)
        .map((name) => name.trim())
        .filter(Boolean);
    return cleaned.length ? cleaned.join(",") : undefined;
}
function validateTimestamp(label, value) {
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) {
        return `${label} must be an RFC3339/ISO 8601 timestamp, received '${value}'.`;
    }
    return null;
}
exports.get_logs = (0, tool_1.tool)("functions", {
    name: "get_logs",
    description: "Use this to retrieve a page of Cloud Functions log entries using Google Cloud Logging advanced filters.",
    inputSchema: zod_1.z.object({
        function_names: zod_1.z
            .array(zod_1.z.string())
            .min(1)
            .optional()
            .describe("Optional list of deployed Cloud Function IDs to filter logs (e.g. ['fnA','fnB'])."),
        page_size: zod_1.z
            .number()
            .int()
            .min(1)
            .max(1000)
            .default(50)
            .describe("Maximum number of log entries to return."),
        order: zod_1.z.enum(["asc", "desc"]).default("desc").describe("Sort order by timestamp"),
        page_token: zod_1.z
            .string()
            .optional()
            .describe("Opaque page token returned from a previous call to continue pagination."),
        min_severity: zod_1.z
            .enum(SEVERITY_LEVELS)
            .optional()
            .describe("Filters results to entries at or above the provided severity level."),
        start_time: zod_1.z
            .string()
            .optional()
            .describe("RFC3339 timestamp (YYYY-MM-DDTHH:MM:SSZ). Only entries with timestamp greater than or equal to this are returned."),
        end_time: zod_1.z
            .string()
            .optional()
            .describe("RFC3339 timestamp (YYYY-MM-DDTHH:MM:SSZ). Only entries with timestamp less than or equal to this are returned."),
        filter: zod_1.z
            .string()
            .optional()
            .describe("Additional Google Cloud Logging advanced filter text that will be AND'ed with the generated filter."),
    }),
    annotations: {
        title: "Get Functions Logs from Cloud Logging",
        readOnlyHint: true,
        openWorldHint: true,
    },
    _meta: {
        requiresAuth: true,
        requiresProject: true,
    },
}, async ({ function_names, page_size, order, page_token, min_severity, start_time, end_time, filter }, { projectId }) => {
    const resolvedOrder = (order === null || order === void 0 ? void 0 : order.toLowerCase()) === "asc" ? "asc" : "desc";
    const resolvedPageSize = page_size !== null && page_size !== void 0 ? page_size : 50;
    const normalizedSelectors = normalizeFunctionSelectors(function_names);
    const filterParts = [(0, functionslog_1.getApiFilter)(normalizedSelectors)];
    if (min_severity) {
        filterParts.push(`severity>="${min_severity}"`);
    }
    if (start_time) {
        const error = validateTimestamp("start_time", start_time);
        if (error)
            return (0, util_1.mcpError)(error);
        filterParts.push(`timestamp>="${start_time}"`);
    }
    if (end_time) {
        const error = validateTimestamp("end_time", end_time);
        if (error)
            return (0, util_1.mcpError)(error);
        filterParts.push(`timestamp<="${end_time}"`);
    }
    if (start_time && end_time && Date.parse(start_time) > Date.parse(end_time)) {
        return (0, util_1.mcpError)("start_time must be less than or equal to end_time.");
    }
    if (filter) {
        filterParts.push(`(${filter})`);
    }
    const combinedFilter = filterParts.join("\n");
    try {
        const { entries, nextPageToken } = await (0, cloudlogging_1.listEntries)(projectId, combinedFilter, resolvedPageSize, resolvedOrder, page_token);
        const formattedEntries = entries.map((entry) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
            const functionName = (_f = (_c = (_b = (_a = entry.resource) === null || _a === void 0 ? void 0 : _a.labels) === null || _b === void 0 ? void 0 : _b.function_name) !== null && _c !== void 0 ? _c : (_e = (_d = entry.resource) === null || _d === void 0 ? void 0 : _d.labels) === null || _e === void 0 ? void 0 : _e.service_name) !== null && _f !== void 0 ? _f : null;
            const payload = (_k = (_j = (_h = (_g = entry.textPayload) !== null && _g !== void 0 ? _g : entry.jsonPayload) !== null && _h !== void 0 ? _h : entry.protoPayload) !== null && _j !== void 0 ? _j : entry.labels) !== null && _k !== void 0 ? _k : null;
            return {
                timestamp: (_m = (_l = entry.timestamp) !== null && _l !== void 0 ? _l : entry.receiveTimestamp) !== null && _m !== void 0 ? _m : null,
                severity: (_o = entry.severity) !== null && _o !== void 0 ? _o : "DEFAULT",
                function: functionName,
                message: (_r = (_q = (_p = entry.textPayload) !== null && _p !== void 0 ? _p : (entry.jsonPayload ? JSON.stringify(entry.jsonPayload) : undefined)) !== null && _q !== void 0 ? _q : (entry.protoPayload ? JSON.stringify(entry.protoPayload) : undefined)) !== null && _r !== void 0 ? _r : "",
                payload,
                log_name: entry.logName,
                trace: (_s = entry.trace) !== null && _s !== void 0 ? _s : null,
                span_id: (_t = entry.spanId) !== null && _t !== void 0 ? _t : null,
            };
        });
        const response = {
            filter: combinedFilter,
            order: resolvedOrder,
            page_size: resolvedPageSize,
            entries: resolvedOrder === "asc" ? formattedEntries : formattedEntries.reverse(),
            next_page_token: nextPageToken !== null && nextPageToken !== void 0 ? nextPageToken : null,
            has_more: Boolean(nextPageToken),
        };
        if (!entries.length) {
            return (0, util_1.toContent)(response, {
                contentPrefix: "No log entries matched the provided filters.\n\n",
            });
        }
        return (0, util_1.toContent)(response);
    }
    catch (err) {
        const errMsg = (0, error_1.getErrMsg)((err === null || err === void 0 ? void 0 : err.original) || err, "Failed to retrieve Cloud Logging entries.");
        return (0, util_1.mcpError)(errMsg);
    }
});
