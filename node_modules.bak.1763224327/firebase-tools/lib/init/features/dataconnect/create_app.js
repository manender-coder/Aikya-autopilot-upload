"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFlutterApp = exports.createNextApp = exports.createReactApp = void 0;
const child_process_1 = require("child_process");
const clc = require("colorette");
const utils_1 = require("../../../utils");
async function createReactApp(webAppId) {
    const args = ["create", "vite@latest", webAppId, "--", "--template", "react", "--no-interactive"];
    await executeCommand("npm", args);
}
exports.createReactApp = createReactApp;
async function createNextApp(webAppId) {
    const args = [
        "create-next-app@latest",
        webAppId,
        "--ts",
        "--eslint",
        "--tailwind",
        "--src-dir",
        "--app",
        "--turbopack",
        "--import-alias",
        '"@/*"',
        "--skip-install",
    ];
    await executeCommand("npx", args);
}
exports.createNextApp = createNextApp;
async function createFlutterApp(webAppId) {
    const args = ["create", webAppId];
    await executeCommand("flutter", args);
}
exports.createFlutterApp = createFlutterApp;
async function executeCommand(command, args) {
    (0, utils_1.logLabeledBullet)("dataconnect", `> ${clc.bold(`${command} ${args.join(" ")}`)}`);
    return new Promise((resolve, reject) => {
        const childProcess = (0, child_process_1.spawn)(command, args, {
            stdio: "inherit",
            shell: true,
        });
        childProcess.on("close", (code) => {
            if (code === 0) {
                resolve();
            }
            else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });
        childProcess.on("error", (err) => {
            reject(err);
        });
    });
}
