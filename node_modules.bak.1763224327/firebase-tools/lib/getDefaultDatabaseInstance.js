"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultDatabaseInstance = void 0;
const projects_1 = require("./management/projects");
async function getDefaultDatabaseInstance(project) {
    var _a;
    const projectDetails = await (0, projects_1.getFirebaseProject)(project);
    return ((_a = projectDetails.resources) === null || _a === void 0 ? void 0 : _a.realtimeDatabaseInstance) || "";
}
exports.getDefaultDatabaseInstance = getDefaultDatabaseInstance;
