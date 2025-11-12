"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crashlyticsTools = void 0;
const notes_1 = require("./notes");
const issues_1 = require("./issues");
const events_1 = require("./events");
const reports_1 = require("./reports");
exports.crashlyticsTools = [
    notes_1.create_note,
    notes_1.delete_note,
    issues_1.get_issue,
    events_1.list_events,
    events_1.batch_get_events,
    notes_1.list_notes,
    reports_1.get_top_issues,
    reports_1.get_top_variants,
    reports_1.get_top_versions,
    reports_1.get_top_apple_devices,
    reports_1.get_top_android_devices,
    reports_1.get_top_operating_systems,
    issues_1.update_issue,
];
