"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localBuild = void 0;
const build_1 = require("@apphosting/build");
async function localBuild(projectRoot, framework) {
    var _a, _b, _c;
    const apphostingBuildOutput = await (0, build_1.localBuild)(projectRoot, framework);
    const annotations = Object.fromEntries(Object.entries(apphostingBuildOutput.metadata).map(([key, value]) => [key, String(value)]));
    const env = (_a = apphostingBuildOutput.runConfig.environmentVariables) === null || _a === void 0 ? void 0 : _a.map(({ variable, value, availability }) => ({
        variable,
        value,
        availability,
    }));
    return {
        outputFiles: (_c = (_b = apphostingBuildOutput.outputFiles) === null || _b === void 0 ? void 0 : _b.serverApp.include) !== null && _c !== void 0 ? _c : [],
        annotations,
        buildConfig: {
            runCommand: apphostingBuildOutput.runConfig.runCommand,
            env: env !== null && env !== void 0 ? env : [],
        },
    };
}
exports.localBuild = localBuild;
