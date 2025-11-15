"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actuate = exports.askQuestions = void 0;
const clc = require("colorette");
const node_fs_1 = require("node:fs");
const path_1 = require("path");
const apiv2_1 = require("../../../apiv2");
const github_1 = require("./github");
const prompt_1 = require("../../../prompt");
const logger_1 = require("../../../logger");
const frameworks_1 = require("../../../frameworks");
const constants_1 = require("../../../frameworks/constants");
const experiments = require("../../../experiments");
const getDefaultHostingSite_1 = require("../../../getDefaultHostingSite");
const utils_1 = require("../../../utils");
const interactive_1 = require("../../../hosting/interactive");
const templates_1 = require("../../../templates");
const error_1 = require("../../../error");
const api_1 = require("../../../hosting/api");
const INDEX_TEMPLATE = (0, templates_1.readTemplateSync)("init/hosting/index.html");
const MISSING_TEMPLATE = (0, templates_1.readTemplateSync)("init/hosting/404.html");
const DEFAULT_IGNORES = ["firebase.json", "**/.*", "**/node_modules/**"];
async function askQuestions(setup, config, options) {
    var _a, _b, _c, _d, _e, _f;
    var _g, _h, _j, _k, _l;
    setup.featureInfo = setup.featureInfo || {};
    setup.featureInfo.hosting = {};
    if (setup.projectId) {
        let hasHostingSite = true;
        try {
            await (0, getDefaultHostingSite_1.getDefaultHostingSite)({ projectId: setup.projectId });
        }
        catch (err) {
            if (err !== getDefaultHostingSite_1.errNoDefaultSite) {
                throw err;
            }
            hasHostingSite = false;
        }
        if (!hasHostingSite &&
            (await (0, prompt_1.confirm)({
                message: "A Firebase Hosting site is required to deploy. Would you like to create one now?",
                default: true,
            }))) {
            const createOptions = {
                projectId: setup.projectId,
                nonInteractive: options.nonInteractive,
            };
            setup.featureInfo.hosting.newSiteId = await (0, interactive_1.pickHostingSiteName)("", createOptions);
        }
    }
    let discoveredFramework = experiments.isEnabled("webframeworks")
        ? await (0, frameworks_1.discover)(config.projectDir, false)
        : undefined;
    if (experiments.isEnabled("webframeworks")) {
        if (discoveredFramework &&
            (await (0, prompt_1.confirm)({
                message: `Detected an existing ${frameworks_1.WebFrameworks[discoveredFramework.framework].name} codebase in the current directory, do you want to use this?`,
                default: true,
            }))) {
            setup.featureInfo.hosting.source = ".";
            setup.featureInfo.hosting.useWebFrameworks = true;
            setup.featureInfo.hosting.useDiscoveredFramework = true;
            setup.featureInfo.hosting.webFramework = discoveredFramework.framework;
        }
        else {
            setup.featureInfo.hosting.useWebFrameworks = await (0, prompt_1.confirm)(`Do you want to use a web framework? (${clc.bold("experimental")})`);
        }
    }
    if (setup.featureInfo.hosting.useWebFrameworks) {
        (_a = (_g = setup.featureInfo.hosting).source) !== null && _a !== void 0 ? _a : (_g.source = await (0, prompt_1.input)({
            message: "What folder would you like to use for your web application's root directory?",
            default: "hosting",
        }));
        discoveredFramework = await (0, frameworks_1.discover)((0, path_1.join)(config.projectDir, setup.featureInfo.hosting.source));
        if (discoveredFramework) {
            const name = frameworks_1.WebFrameworks[discoveredFramework.framework].name;
            (_b = (_h = setup.featureInfo.hosting).useDiscoveredFramework) !== null && _b !== void 0 ? _b : (_h.useDiscoveredFramework = await (0, prompt_1.confirm)({
                message: `Detected an existing ${name} codebase in ${setup.featureInfo.hosting.source}, should we use this?`,
                default: true,
            }));
            if (setup.featureInfo.hosting.useDiscoveredFramework)
                setup.featureInfo.hosting.webFramework = discoveredFramework.framework;
        }
        const choices = [];
        for (const value in frameworks_1.WebFrameworks) {
            if (frameworks_1.WebFrameworks[value]) {
                const { name, init } = frameworks_1.WebFrameworks[value];
                if (init)
                    choices.push({ name, value });
            }
        }
        const defaultChoice = (_c = choices.find(({ value }) => value === (discoveredFramework === null || discoveredFramework === void 0 ? void 0 : discoveredFramework.framework))) === null || _c === void 0 ? void 0 : _c.value;
        (_d = (_j = setup.featureInfo.hosting).webFramework) !== null && _d !== void 0 ? _d : (_j.webFramework = await (0, prompt_1.select)({
            message: "Please choose the framework:",
            default: defaultChoice,
            choices,
        }));
        setup.featureInfo.hosting.region =
            setup.featureInfo.hosting.region ||
                (await (0, prompt_1.select)({
                    message: "In which region would you like to host server-side content, if applicable?",
                    default: constants_1.DEFAULT_REGION,
                    choices: constants_1.ALLOWED_SSR_REGIONS.filter((region) => region.recommended),
                }));
    }
    else {
        logger_1.logger.info();
        logger_1.logger.info(`Your ${clc.bold("public")} directory is the folder (relative to your project directory) that`);
        logger_1.logger.info(`will contain Hosting assets to be uploaded with ${clc.bold("firebase deploy")}. If you`);
        logger_1.logger.info("have a build process for your assets, use your build's output directory.");
        logger_1.logger.info();
        (_e = (_k = setup.featureInfo.hosting).public) !== null && _e !== void 0 ? _e : (_k.public = await (0, prompt_1.input)({
            message: "What do you want to use as your public directory?",
            default: "public",
        }));
        (_f = (_l = setup.featureInfo.hosting).spa) !== null && _f !== void 0 ? _f : (_l.spa = await (0, prompt_1.confirm)("Configure as a single-page app (rewrite all urls to /index.html)?"));
    }
    if (await (0, prompt_1.confirm)("Set up automatic builds and deploys with GitHub?")) {
        return (0, github_1.initGitHub)(setup);
    }
}
exports.askQuestions = askQuestions;
async function actuate(setup, config, options) {
    var _a;
    const hostingInfo = (_a = setup.featureInfo) === null || _a === void 0 ? void 0 : _a.hosting;
    if (!hostingInfo) {
        throw new error_1.FirebaseError("Could not find hosting info in setup.featureInfo.hosting. This should not happen.", { exit: 2 });
    }
    if (hostingInfo.newSiteId && setup.projectId) {
        await (0, api_1.createSite)(setup.projectId, hostingInfo.newSiteId);
        logger_1.logger.info();
        (0, utils_1.logSuccess)(`Firebase Hosting site ${hostingInfo.newSiteId} created!`);
        logger_1.logger.info();
    }
    if (hostingInfo.webFramework) {
        if (!hostingInfo.useDiscoveredFramework) {
            if (hostingInfo.source && (0, node_fs_1.existsSync)(hostingInfo.source)) {
                (0, node_fs_1.rmSync)(hostingInfo.source, { recursive: true });
            }
            await frameworks_1.WebFrameworks[hostingInfo.webFramework].init(setup, config);
        }
        setup.config.hosting = {
            source: hostingInfo.source,
            ignore: DEFAULT_IGNORES,
            frameworksBackend: {
                region: hostingInfo.region,
            },
        };
    }
    else {
        setup.config.hosting = {
            public: hostingInfo.public,
            ignore: DEFAULT_IGNORES,
        };
        if (hostingInfo.spa) {
            setup.config.hosting.rewrites = [{ source: "**", destination: "/index.html" }];
        }
        else {
            await config.askWriteProjectFile(`${hostingInfo.public}/404.html`, MISSING_TEMPLATE, !!options.force);
        }
        const c = new apiv2_1.Client({ urlPrefix: "https://www.gstatic.com", auth: false });
        const response = await c.get("/firebasejs/releases.json");
        await config.askWriteProjectFile(`${hostingInfo.public}/index.html`, INDEX_TEMPLATE.replace(/{{VERSION}}/g, response.body.current.version), !!options.force);
    }
}
exports.actuate = actuate;
