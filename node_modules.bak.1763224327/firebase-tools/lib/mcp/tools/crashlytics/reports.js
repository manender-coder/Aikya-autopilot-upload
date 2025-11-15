"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_top_operating_systems = exports.get_top_android_devices = exports.get_top_apple_devices = exports.get_top_versions = exports.get_top_variants = exports.get_top_issues = void 0;
const tool_1 = require("../../tool");
const util_1 = require("../../util");
const reports_1 = require("../../../crashlytics/reports");
const filters_1 = require("../../../crashlytics/filters");
function getReportContent(report, additionalPrompt) {
    return async ({ appId, filter, pageSize }) => {
        var _a;
        if (!appId)
            return (0, util_1.mcpError)(`Must specify 'appId' parameter.`);
        filter !== null && filter !== void 0 ? filter : (filter = {});
        if (!!filter.intervalStartTime && !filter.intervalEndTime) {
            filter.intervalEndTime = new Date().toISOString();
        }
        if (report === reports_1.CrashlyticsReport.TopIssues && !!filter.issueId) {
            delete filter.issueId;
        }
        (0, filters_1.validateEventFilters)(filter);
        const reportResponse = (0, reports_1.simplifyReport)(await (0, reports_1.getReport)(report, appId, filter, pageSize));
        if (!((_a = reportResponse.groups) === null || _a === void 0 ? void 0 : _a.length)) {
            additionalPrompt = "This report response contains no results.";
        }
        if (additionalPrompt) {
            reportResponse.usage = (reportResponse.usage || "").concat("\n", additionalPrompt);
        }
        return (0, util_1.toContent)(reportResponse);
    };
}
exports.get_top_issues = (0, tool_1.tool)("crashlytics", {
    name: "get_top_issues",
    description: `Use this to count events and distinct impacted users, grouped by *issue*.
      Groups are sorted by event count, in descending order.
      Only counts events matching the given filters.`,
    inputSchema: reports_1.ReportInputSchema,
    annotations: {
        title: "Get Crashlytics Top Issues Report",
        readOnlyHint: true,
    },
    _meta: {
        requiresAuth: true,
    },
}, getReportContent(reports_1.CrashlyticsReport.TopIssues, `The crashlytics_batch_get_event tool can retrieve the sample events in this response.
    Pass the sampleEvent in the names field.
    The crashlytics_list_events tool can retrieve a list of events for an issue in this response.
    Pass the issue.id in the filter.issueId field.`));
exports.get_top_variants = (0, tool_1.tool)("crashlytics", {
    name: "get_top_variants",
    description: `Counts events and distinct impacted users, grouped by issue *variant*.
      Groups are sorted by event count, in descending order.
      Only counts events matching the given filters.`,
    inputSchema: reports_1.ReportInputSchema,
    annotations: {
        title: "Get Crashlytics Top Variants Report",
        readOnlyHint: true,
    },
    _meta: {
        requiresAuth: true,
    },
}, getReportContent(reports_1.CrashlyticsReport.TopVariants, `The crashlytics_get_top_issues tool can report the top issues for the variants in this response.
    Pass the variant.displayName in the filter.variantDisplayNames field. 
    The crashlytics_list_events tool can retrieve a list of events for a variant in this response.`));
exports.get_top_versions = (0, tool_1.tool)("crashlytics", {
    name: "get_top_versions",
    description: `Counts events and distinct impacted users, grouped by *version*.
      Groups are sorted by event count, in descending order.
      Only counts events matching the given filters.`,
    inputSchema: reports_1.ReportInputSchema,
    annotations: {
        title: "Get Crashlytics Top Versions Report",
        readOnlyHint: true,
    },
    _meta: {
        requiresAuth: true,
    },
}, getReportContent(reports_1.CrashlyticsReport.TopVersions, `The crashlytics_get_top_issues tool can report the top issues for the versions in this response.
    Pass the version.displayName in the filter.versionDisplayNames field. 
    The crashlytics_list_events tool can retrieve a list of events for a version in this response.`));
exports.get_top_apple_devices = (0, tool_1.tool)("crashlytics", {
    name: "get_top_apple_devices",
    description: `Counts events and distinct impacted users, grouped by apple *device*.
      Groups are sorted by event count, in descending order.
      Only counts events matching the given filters.
      Only relevant for iOS, iPadOS and MacOS applications.`,
    inputSchema: reports_1.ReportInputSchema,
    annotations: {
        title: "Get Crashlytics Top Apple Devices Report",
        readOnlyHint: true,
    },
    _meta: {
        requiresAuth: true,
    },
}, getReportContent(reports_1.CrashlyticsReport.TopAppleDevices, `The crashlytics_get_top_issues tool can report the top issues for the devices in this response.
    Pass the device.displayName in the filter.deviceDisplayNames field. 
    The crashlytics_list_events tool can retrieve a list of events for a device in this response.`));
exports.get_top_android_devices = (0, tool_1.tool)("crashlytics", {
    name: "get_top_android_devices",
    description: `Counts events and distinct impacted users, grouped by android *device*.
      Groups are sorted by event count, in descending order.
      Only counts events matching the given filters.
      Only relevant for Android applications.`,
    inputSchema: reports_1.ReportInputSchema,
    annotations: {
        title: "Get Crashlytics Top Android Devices Report",
        readOnlyHint: true,
    },
    _meta: {
        requiresAuth: true,
    },
}, getReportContent(reports_1.CrashlyticsReport.TopAndroidDevices, `The crashlytics_get_top_issues tool can report the top issues for the devices in this response.
    Pass the device.displayName in the filter.deviceDisplayNames field. 
    The crashlytics_list_events tool can retrieve a list of events for a device in this response.`));
exports.get_top_operating_systems = (0, tool_1.tool)("crashlytics", {
    name: "get_top_operating_systems",
    description: `Counts events and distinct impacted users, grouped by *operating system*.
      Groups are sorted by event count, in descending order.
      Only counts events matching the given filters.`,
    inputSchema: reports_1.ReportInputSchema,
    annotations: {
        title: "Get Crashlytics Top Operating Systems Report",
        readOnlyHint: true,
    },
    _meta: {
        requiresAuth: true,
    },
}, getReportContent(reports_1.CrashlyticsReport.TopOperatingSystems, `The crashlytics_get_top_issues tool can report the top issues for the operating systems in this response.
    Pass the operatingSystem.displayName in the filter.operatingSystemDisplayNames field. 
    The crashlytics_list_events tool can retrieve a list of events for an operating system in this response.`));
