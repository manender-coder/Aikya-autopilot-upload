"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_users = void 0;
const zod_1 = require("zod");
const tool_1 = require("../../tool");
const util_1 = require("../../util");
const auth_1 = require("../../../gcp/auth");
exports.get_users = (0, tool_1.tool)("auth", {
    name: "get_users",
    description: "Use this to retrieve one or more Firebase Auth users based on a list of UIDs or a list of emails.",
    inputSchema: zod_1.z.object({
        uids: zod_1.z.array(zod_1.z.string()).optional().describe("A list of user UIDs to retrieve."),
        emails: zod_1.z.array(zod_1.z.string()).optional().describe("A list of user emails to retrieve."),
        phone_numbers: zod_1.z
            .array(zod_1.z.string())
            .optional()
            .describe("A list of user phone numbers to retrieve."),
        limit: zod_1.z
            .number()
            .optional()
            .default(100)
            .describe("The numbers of users to return. 500 is the upper limit. Defaults to 100."),
    }),
    annotations: {
        title: "Get Firebase Auth Users",
        readOnlyHint: true,
    },
    _meta: {
        requiresAuth: true,
        requiresProject: true,
    },
}, async ({ uids, emails, phone_numbers, limit }, { projectId }) => {
    const prune = (user) => {
        const { passwordHash, salt } = user, prunedUser = __rest(user, ["passwordHash", "salt"]);
        return prunedUser;
    };
    let users = [];
    if (uids === null || uids === void 0 ? void 0 : uids.length) {
        const promises = uids.map((uid) => (0, auth_1.findUser)(projectId, undefined, undefined, uid).catch(() => null));
        users.push(...(await Promise.all(promises)).filter((u) => !!u));
    }
    if (emails === null || emails === void 0 ? void 0 : emails.length) {
        const promises = emails.map((email) => (0, auth_1.findUser)(projectId, email, undefined, undefined).catch(() => null));
        users.push(...(await Promise.all(promises)).filter((u) => !!u));
    }
    if (phone_numbers === null || phone_numbers === void 0 ? void 0 : phone_numbers.length) {
        const promises = phone_numbers.map((phone) => (0, auth_1.findUser)(projectId, undefined, phone, undefined).catch(() => null));
        users.push(...(await Promise.all(promises)).filter((u) => !!u));
    }
    if (!(uids === null || uids === void 0 ? void 0 : uids.length) && !(emails === null || emails === void 0 ? void 0 : emails.length) && !(phone_numbers === null || phone_numbers === void 0 ? void 0 : phone_numbers.length)) {
        users = await (0, auth_1.listUsers)(projectId, limit || 100);
    }
    return (0, util_1.toContent)(users.map(prune));
});
