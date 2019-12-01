"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const fs_1 = require("fs");
const EVENT_DEPLOYMENT = 'deployment';
const EVENT_PUSH = 'push';
function loadJsonFromFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield fs_1.promises.stat(filePath))) {
            throw new Error(`Deployment event file doesn't exist: "${filePath}"`);
        }
        return yield fs_1.promises.readFile(filePath);
    });
}
function parseDeploymentJson(buffer) {
    var _a, _b, _c;
    let event = JSON.parse(buffer.toString());
    return {
        environment: event.deployment.environment,
        application: ((_a = event.deployment.payload) === null || _a === void 0 ? void 0 : _a.application) || '',
        valuesFile: ((_b = event.deployment.payload) === null || _b === void 0 ? void 0 : _b.values_file) || '',
        keyPaths: ((_c = event.deployment.payload) === null || _c === void 0 ? void 0 : _c.key_paths) || '',
        value: event.deployment.sha || '',
    };
}
function merge(...events) {
    let event = {};
    events.forEach((e) => {
        Object.entries(e).forEach(([key, value]) => {
            event[key] = value.toString().length > 0 ? value.toString() : event[key];
        });
    });
    return event;
}
exports.merge = merge;
function outputEvent(event) {
    core.setOutput('environment', event.environment);
    core.setOutput('application', event.application);
    core.setOutput('values_file', event.valuesFile);
    core.setOutput('key_paths', event.keyPaths);
    core.setOutput('value', event.value);
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        let event = {
            application: core.getInput('application'),
            valuesFile: core.getInput('values_file'),
            keyPaths: core.getInput('key_paths'),
        };
        switch (process.env.GITHUB_EVENT_NAME) {
            case EVENT_DEPLOYMENT:
                core.info('Using deployment event');
                let filePath = process.env.GITHUB_EVENT_PATH || '';
                let buffer = yield loadJsonFromFile(filePath);
                event = merge(event, parseDeploymentJson(buffer));
                break;
            case EVENT_PUSH:
                core.info('Using push event');
                event = merge(event, {
                    environment: core.getInput('push_environment'),
                    value: core.getInput('push_value')
                });
                break;
            default:
                throw new Error(`Unsupported Github Event "${process.env.GITHUB_EVENT_NAME}"`);
        }
        outputEvent(event);
    });
}
if (process.env.GITHUB_ACTIONS) {
    run().catch((err) => core.setFailed(err.toString()));
}
