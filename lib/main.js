"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
function loadJson(buffer) {
    let event = JSON.parse(buffer.toString());
    return {
        environment: event.environment,
        application: event.payload.application,
        valuesFile: event.payload.values_file,
        keyPaths: event.payload.key_paths,
        value: event.payload.set_value,
    };
}
function outputEvent(event) {
    core.setOutput('environment', event.environment);
    core.setOutput('application', event.application);
    core.setOutput('values_file', event.valuesFile);
    core.setOutput('key_paths', event.keyPaths);
    core.setOutput('value', event.value);
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        switch (process.env.GITHUB_EVENT_NAME) {
            case EVENT_DEPLOYMENT:
                core.info('Using deployment event');
                let filePath = process.env.GITHUB_EVENT_PATH;
                if (filePath === undefined) {
                    core.setFailed('Deployment event doesn\'t have $GITHUB_EVENT_PATH defined');
                    return;
                }
                if (!(yield fs_1.promises.stat(filePath))) {
                    core.setFailed(`Deployment event file doesn't exist: "${filePath}"`);
                    return;
                }
                let buffer = yield fs_1.promises.readFile(filePath);
                return outputEvent(loadJson(buffer));
            case EVENT_PUSH:
                core.info('Using push event');
                let fallback = {
                    environment: core.getInput('fallback_environment', { required: true }),
                    application: core.getInput('fallback_application', { required: true }),
                    valuesFile: core.getInput('fallback_values_file', { required: true }),
                    keyPaths: core.getInput('fallback_key_paths', { required: true }),
                    value: core.getInput('fallback_push_sha', { required: true }),
                };
                return outputEvent(fallback);
            default:
                core.setFailed(`Unsupported Github Event "${process.env.GITHUB_EVENT_NAME}"`);
                return;
        }
    });
}
run().catch((err) => core.setFailed(err.toString()));
