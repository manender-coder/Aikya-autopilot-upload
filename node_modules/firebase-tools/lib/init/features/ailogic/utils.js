"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAppExists = exports.validateProjectNumberMatch = exports.parseAppId = exports.getConfigFileName = void 0;
const apps_1 = require("../../../management/apps");
const error_1 = require("../../../error");
function getConfigFileName(platform) {
    switch (platform) {
        case apps_1.AppPlatform.IOS:
            return "GoogleService-Info.plist";
        case apps_1.AppPlatform.ANDROID:
            return "google-services.json";
        case apps_1.AppPlatform.WEB:
            return "firebase-config.json";
        default:
            throw new error_1.FirebaseError(`Unsupported platform: ${platform}`, { exit: 2 });
    }
}
exports.getConfigFileName = getConfigFileName;
function parseAppId(appId) {
    var _a, _b;
    const pattern = /^(?<version>\d+):(?<projectNumber>\d+):(?<platform>ios|android|web):([0-9a-fA-F]+)$/;
    const match = pattern.exec(appId);
    if (!match) {
        throw new error_1.FirebaseError(`Invalid app ID format: ${appId}. Expected format: 1:PROJECT_NUMBER:PLATFORM:IDENTIFIER`, { exit: 1 });
    }
    const platformString = ((_a = match.groups) === null || _a === void 0 ? void 0 : _a.platform) || "";
    let platform;
    switch (platformString) {
        case "ios":
            platform = apps_1.AppPlatform.IOS;
            break;
        case "android":
            platform = apps_1.AppPlatform.ANDROID;
            break;
        case "web":
            platform = apps_1.AppPlatform.WEB;
            break;
        default:
            throw new error_1.FirebaseError(`Unsupported platform: ${platformString}`, { exit: 1 });
    }
    return {
        projectNumber: ((_b = match.groups) === null || _b === void 0 ? void 0 : _b.projectNumber) || "",
        appId: appId,
        platform,
    };
}
exports.parseAppId = parseAppId;
function validateProjectNumberMatch(appInfo, projectInfo) {
    if (projectInfo.projectNumber !== appInfo.projectNumber) {
        throw new error_1.FirebaseError(`App ${appInfo.appId} belongs to project number ${appInfo.projectNumber} but current project has number ${projectInfo.projectNumber}.`, { exit: 1 });
    }
}
exports.validateProjectNumberMatch = validateProjectNumberMatch;
async function validateAppExists(appInfo, projectId) {
    try {
        const apps = await (0, apps_1.listFirebaseApps)(projectId, appInfo.platform);
        const app = apps.find((a) => a.appId === appInfo.appId);
        if (!app) {
            throw new error_1.FirebaseError(`App ${appInfo.appId} does not exist in project ${projectId}.`, {
                exit: 1,
            });
        }
        return app;
    }
    catch (error) {
        if (error instanceof error_1.FirebaseError) {
            throw error;
        }
        throw new error_1.FirebaseError(`App ${appInfo.appId} does not exist or is not accessible.`, {
            exit: 1,
            original: error instanceof Error ? error : new Error(String(error)),
        });
    }
}
exports.validateAppExists = validateAppExists;
