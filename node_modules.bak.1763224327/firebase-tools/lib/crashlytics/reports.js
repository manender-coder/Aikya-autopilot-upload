"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReport = exports.simplifyReport = exports.CrashlyticsReport = exports.ReportInputSchema = void 0;
const zod_1 = require("zod");
const lodash_1 = require("lodash");
const logger_1 = require("../logger");
const utils_1 = require("./utils");
const filters_1 = require("./filters");
const DEFAULT_PAGE_SIZE = 10;
exports.ReportInputSchema = zod_1.z.object({
    appId: filters_1.ApplicationIdSchema,
    filter: filters_1.EventFilterSchema,
    pageSize: zod_1.z.number().optional().describe("Number of rows to return").default(DEFAULT_PAGE_SIZE),
});
var CrashlyticsReport;
(function (CrashlyticsReport) {
    CrashlyticsReport["TopIssues"] = "topIssues";
    CrashlyticsReport["TopVariants"] = "topVariants";
    CrashlyticsReport["TopVersions"] = "topVersions";
    CrashlyticsReport["TopOperatingSystems"] = "topOperatingSystems";
    CrashlyticsReport["TopAppleDevices"] = "topAppleDevices";
    CrashlyticsReport["TopAndroidDevices"] = "topAndroidDevices";
})(CrashlyticsReport = exports.CrashlyticsReport || (exports.CrashlyticsReport = {}));
function simplifyReport(report) {
    const simplifiedReport = (0, lodash_1.cloneDeep)(report);
    if (!simplifiedReport.groups)
        return report;
    simplifiedReport.groups.forEach((group) => {
        if (group.device) {
            delete group.device.model;
            delete group.device.manufacturer;
        }
        if (group.version) {
            delete group.version.buildVersion;
            delete group.version.displayVersion;
        }
        if (group.operatingSystem) {
            delete group.operatingSystem.displayVersion;
            delete group.operatingSystem.os;
        }
    });
    return simplifiedReport;
}
exports.simplifyReport = simplifyReport;
async function getReport(report, appId, filter, pageSize = DEFAULT_PAGE_SIZE) {
    const requestProjectNumber = (0, utils_1.parseProjectNumber)(appId);
    const queryParams = (0, filters_1.filterToUrlSearchParams)(filter);
    queryParams.set("page_size", `${pageSize}`);
    logger_1.logger.debug(`[crashlytics] report ${report} called with appId: ${appId} filter: ${queryParams.toString()}, page_size: ${pageSize}`);
    const response = await utils_1.CRASHLYTICS_API_CLIENT.request({
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        path: `/projects/${requestProjectNumber}/apps/${appId}/reports/${report}`,
        queryParams: queryParams,
        timeout: utils_1.TIMEOUT,
    });
    return response.body;
}
exports.getReport = getReport;
