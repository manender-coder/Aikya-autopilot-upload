"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEventFilters = exports.filterToUrlSearchParams = exports.EventFilterSchema = exports.IssueIdSchema = exports.ApplicationIdSchema = void 0;
const zod_1 = require("zod");
const error_1 = require("../error");
exports.ApplicationIdSchema = zod_1.z
    .string()
    .describe("Firebase app id. For an Android application, read the " +
    "mobilesdk_app_id value specified in the google-services.json file for " +
    "the current package name. For an iOS Application, read the GOOGLE_APP_ID " +
    "from GoogleService-Info.plist. If neither is available, ask the user to " +
    "provide the app id.");
exports.IssueIdSchema = zod_1.z.string().describe("Crashlytics issue id, as hexidecimal uuid");
exports.EventFilterSchema = zod_1.z
    .object({
    intervalStartTime: zod_1.z
        .string()
        .optional()
        .describe(`A timestamp in ISO 8601 string format. Must be within the last 90 days. Defaults to 7 days ago.`),
    intervalEndTime: zod_1.z
        .string()
        .optional()
        .describe(`A timestamp in ISO 8601 string format. Must be within the last 90 days. Defaults to now.`),
    versionDisplayNames: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe(`Counts events originating from the given app versions. Must be obtained from the *displayName* field in an API response. `),
    issueId: zod_1.z.string().optional().describe(`Count events for the given issue`),
    issueVariantId: zod_1.z.string().optional().describe(`Count events for the given issue variant`),
    issueErrorTypes: zod_1.z
        .array(zod_1.z.enum(["FATAL", "NON_FATAL", "ANR"]))
        .optional()
        .describe(`Counts FATAL events (crashes), NON_FATAL events (exceptions) or ANR events (application not responding)`),
    issueSignals: zod_1.z
        .array(zod_1.z.enum(["SIGNAL_EARLY", "SIGNAL_FRESH", "SIGNAL_REGRESSED", "SIGNAL_REPETITIVE"]))
        .optional()
        .describe(`Counts events matching the given signals`),
    operatingSystemDisplayNames: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe(`Counts events originating from the given operating systems. Must be obtained from the *displayName* field in an API response.`),
    deviceDisplayNames: zod_1.z
        .array(zod_1.z.string())
        .optional()
        .describe(`Must be obtained from the *displayName* field in an API response.`),
    deviceFormFactors: zod_1.z
        .array(zod_1.z.enum(["PHONE", "TABLET", "DESKTOP", "TV", "WATCH"]))
        .optional()
        .describe(`Counts events originating from the given device form factors`),
})
    .optional()
    .describe(`Only events matching the given filters will be counted. All filters are optional. 
    If setting a time interval, set both intervalStartTime and intervalEndTime.`);
const toolToParamMap = {
    intervalStartTime: "filter.interval.start_time",
    intervalEndTime: "filter.interval.end_time",
    versionDisplayNames: "filter.version.display_names",
    issueId: "filter.issue.id",
    issueVariantId: "filter.issue.variant_id",
    issueErrorTypes: "filter.issue.error_types",
    issueSignals: "filter.issue.signals",
    operatingSystemDisplayNames: "filter.operating_system.display_names",
    deviceDisplayNames: "filter.device.display_names",
    deviceFormFactors: "filter.device.form_factors",
};
function filterToUrlSearchParams(filter) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filter || {})) {
        if (value === undefined) {
            continue;
        }
        const paramKey = toolToParamMap[key];
        if (Array.isArray(value)) {
            for (const v of value) {
                params.append(paramKey, v);
            }
        }
        else if (value) {
            params.set(paramKey, value);
        }
    }
    return params;
}
exports.filterToUrlSearchParams = filterToUrlSearchParams;
const displayNamePattern = /^[^()]+\s+\([^()]+\)$/;
function validateEventFilters(filter) {
    if (!filter)
        return;
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    if (filter.intervalStartTime && new Date(filter.intervalStartTime) < ninetyDaysAgo) {
        throw new error_1.FirebaseError("intervalStartTime must be less than 90 days in the past");
    }
    if (filter.deviceDisplayNames) {
        filter.deviceDisplayNames.forEach((dn) => {
            if (!displayNamePattern.test(dn)) {
                throw new error_1.FirebaseError("deviceDisplayNames must match pattern 'manufacturer (device)'");
            }
        });
    }
    if (filter.operatingSystemDisplayNames) {
        filter.operatingSystemDisplayNames.forEach((dn) => {
            if (!displayNamePattern.test(dn)) {
                throw new error_1.FirebaseError("operatingSystemDisplayNames must match pattern 'os (version)'");
            }
        });
    }
    if (filter.versionDisplayNames) {
        filter.versionDisplayNames.forEach((dn) => {
            if (!displayNamePattern.test(dn)) {
                throw new error_1.FirebaseError("versionDisplayNames must match pattern 'version (build)'");
            }
        });
    }
}
exports.validateEventFilters = validateEventFilters;
