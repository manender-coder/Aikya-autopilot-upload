"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromYaml = exports.toYaml = void 0;
const jsYaml = require("js-yaml");
const error_1 = require("../error");
const ALLOWED_YAML_STEP_KEYS = new Set(["goal", "hint", "successCriteria"]);
const ALLOWED_YAML_TEST_CASE_KEYS = new Set([
    "displayName",
    "id",
    "prerequisiteTestCaseId",
    "steps",
]);
function extractIdFromResourceName(name) {
    var _a;
    return (_a = name.split("/").pop()) !== null && _a !== void 0 ? _a : "";
}
function toYamlTestCases(testCases) {
    return testCases.map((testCase) => (Object.assign(Object.assign({ displayName: testCase.displayName, id: extractIdFromResourceName(testCase.name) }, (testCase.prerequisiteTestCase && {
        prerequisiteTestCaseId: extractIdFromResourceName(testCase.prerequisiteTestCase),
    })), { steps: testCase.aiInstructions.steps.map((step) => (Object.assign(Object.assign({ goal: step.goal }, (step.hint && { hint: step.hint })), (step.successCriteria && { successCriteria: step.successCriteria })))) })));
}
function toYaml(testCases) {
    return jsYaml.safeDump(toYamlTestCases(testCases));
}
exports.toYaml = toYaml;
function castExists(it, thing) {
    if (it == null) {
        throw new error_1.FirebaseError(`"${thing}" is required`);
    }
    return it;
}
function checkAllowedKeys(allowedKeys, o) {
    for (const key of Object.keys(o)) {
        if (!allowedKeys.has(key)) {
            throw new error_1.FirebaseError(`unexpected property "${key}"`);
        }
    }
}
function fromYamlTestCases(appName, yamlTestCases) {
    return yamlTestCases.map((yamlTestCase) => {
        checkAllowedKeys(ALLOWED_YAML_TEST_CASE_KEYS, yamlTestCase);
        return Object.assign(Object.assign({ displayName: castExists(yamlTestCase.displayName, "displayName"), aiInstructions: {
                steps: castExists(yamlTestCase.steps, "steps").map((yamlStep) => {
                    checkAllowedKeys(ALLOWED_YAML_STEP_KEYS, yamlStep);
                    return Object.assign(Object.assign({ goal: castExists(yamlStep.goal, "goal") }, (yamlStep.hint && { hint: yamlStep.hint })), (yamlStep.successCriteria && {
                        successCriteria: yamlStep.successCriteria,
                    }));
                }),
            } }, (yamlTestCase.id && {
            name: `${appName}/testCases/${yamlTestCase.id}`,
        })), (yamlTestCase.prerequisiteTestCaseId && {
            prerequisiteTestCase: `${appName}/testCases/${yamlTestCase.prerequisiteTestCaseId}`,
        }));
    });
}
function fromYaml(appName, yaml) {
    let parsedYaml;
    try {
        parsedYaml = jsYaml.safeLoad(yaml);
    }
    catch (err) {
        throw new error_1.FirebaseError(`Failed to parse YAML: ${(0, error_1.getErrMsg)(err)}`);
    }
    if (!Array.isArray(parsedYaml)) {
        throw new error_1.FirebaseError("YAML file must contain a list of test cases.");
    }
    return fromYamlTestCases(appName, parsedYaml);
}
exports.fromYaml = fromYaml;
