"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShortOperationName = void 0;
const error_1 = require("../error");
function getShortOperationName(operationName) {
    let opName = operationName;
    if (operationName.includes("/operations/")) {
        opName = operationName.split("/operations/")[1];
    }
    if (opName.length === 0 || opName.includes("/")) {
        throw new error_1.FirebaseError(`"${operationName}" is not a valid operation name.`);
    }
    return opName;
}
exports.getShortOperationName = getShortOperationName;
