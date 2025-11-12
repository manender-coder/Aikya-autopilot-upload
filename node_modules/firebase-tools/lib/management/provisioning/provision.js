"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.provisionFirebaseApp = exports.buildProvisionRequest = exports.buildParentString = exports.buildAppNamespace = void 0;
const apiv2_1 = require("../../apiv2");
const api_1 = require("../../api");
const error_1 = require("../../error");
const logger_1 = require("../../logger");
const operation_poller_1 = require("../../operation-poller");
const apps_1 = require("../apps");
const errorHandler_1 = require("./errorHandler");
const apiClient = new apiv2_1.Client({
    urlPrefix: (0, api_1.firebaseApiOrigin)(),
    apiVersion: "v1alpha",
});
function buildAppNamespace(app) {
    let namespace;
    if (app.appId) {
        return app.appId;
    }
    switch (app.platform) {
        case apps_1.AppPlatform.IOS:
            namespace = app.bundleId || "";
            break;
        case apps_1.AppPlatform.ANDROID:
            namespace = app.packageName || "";
            break;
        case apps_1.AppPlatform.WEB:
            namespace = app.webAppId || "";
            break;
        default:
            throw new error_1.FirebaseError("Unsupported platform", { exit: 2 });
    }
    if (!namespace) {
        throw new error_1.FirebaseError("App namespace cannot be empty", { exit: 2 });
    }
    return namespace;
}
exports.buildAppNamespace = buildAppNamespace;
function buildParentString(parent) {
    switch (parent.type) {
        case "existing_project":
            return `projects/${parent.projectId}`;
        case "organization":
            return `organizations/${parent.organizationId}`;
        case "folder":
            return `folders/${parent.folderId}`;
        default:
            throw new error_1.FirebaseError("Unsupported parent type", { exit: 2 });
    }
}
exports.buildParentString = buildParentString;
function buildProvisionRequest(options) {
    var _a, _b;
    const platformInput = (() => {
        switch (options.app.platform) {
            case apps_1.AppPlatform.IOS:
                return {
                    appleInput: {
                        appStoreId: options.app.appStoreId,
                        teamId: options.app.teamId,
                    },
                };
            case apps_1.AppPlatform.ANDROID:
                return {
                    androidInput: {
                        sha1Hashes: options.app.sha1Hashes,
                        sha256Hashes: options.app.sha256Hashes,
                    },
                };
            case apps_1.AppPlatform.WEB:
                return { webInput: {} };
        }
    })();
    return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ appNamespace: buildAppNamespace(options.app), displayName: options.app.displayName }, (options.project.parent && { parent: buildParentString(options.project.parent) })), (((_a = options.features) === null || _a === void 0 ? void 0 : _a.location) && { location: options.features.location })), (options.requestId && { requestId: options.requestId })), (((_b = options.features) === null || _b === void 0 ? void 0 : _b.firebaseAiLogicInput) && {
        firebaseAiLogicInput: options.features.firebaseAiLogicInput,
    })), platformInput);
}
exports.buildProvisionRequest = buildProvisionRequest;
async function provisionFirebaseApp(options) {
    try {
        const request = buildProvisionRequest(options);
        logger_1.logger.debug("[provision] Starting Firebase app provisioning...");
        logger_1.logger.debug(`[provision] Request: ${JSON.stringify(request, null, 2)}`);
        const response = await apiClient.request({
            method: "POST",
            path: "/firebase:provisionFirebaseApp",
            body: request,
        });
        logger_1.logger.debug(`[provision] Operation started: ${response.body.name}`);
        logger_1.logger.debug("[provision] Polling for operation completion...");
        const result = await (0, operation_poller_1.pollOperation)({
            pollerName: "Provision Firebase App Poller",
            apiOrigin: (0, api_1.firebaseApiOrigin)(),
            apiVersion: "v1beta1",
            operationResourceName: response.body.name,
            masterTimeout: 180000,
            backoff: 100,
            maxBackoff: 5000,
        });
        logger_1.logger.debug("[provision] Firebase app provisioning completed successfully");
        return result;
    }
    catch (err) {
        throw (0, errorHandler_1.enhanceProvisioningError)(err, "Failed to provision Firebase app");
    }
}
exports.provisionFirebaseApp = provisionFirebaseApp;
