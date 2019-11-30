import * as core from '@actions/core';
import {promises as fs} from 'fs';

interface githubDeploymentPayload {
    application: string,
    values_file: string,
    key_paths: string,
    set_value: string,
}

interface githubDeployment {
    sha: string,
    environment: string,
    payload: githubDeploymentPayload
}

interface eventDetails {
    environment: string,
    application: string,
    valuesFile: string,
    keyPaths: string,
    value: string,
}

const EVENT_DEPLOYMENT = 'deployment';
const EVENT_PUSH = 'push';

function loadJson(buffer: Buffer): eventDetails {
    let event = <githubDeployment>JSON.parse(buffer.toString());
    return <eventDetails>{
        environment: event.environment,
        application: event.payload.application,
        valuesFile: event.payload.values_file,
        keyPaths: event.payload.key_paths,
        value: event.payload.set_value,
    }
}

function outputEvent(event: eventDetails) {
    core.setOutput('environment', event.environment);
    core.setOutput('application', event.application);
    core.setOutput('values_file', event.valuesFile);
    core.setOutput('key_paths', event.keyPaths);
    core.setOutput('value', event.value);
}

async function run() {
    switch (process.env.GITHUB_EVENT_NAME) {
        case EVENT_DEPLOYMENT:
            core.info('Using deployment event');
            let filePath = process.env.GITHUB_EVENT_PATH;
            if (filePath === undefined) {
                core.setFailed('Deployment event doesn\'t have $GITHUB_EVENT_PATH defined');
                return
            }
            if (!await fs.stat(filePath)) {
                core.setFailed(`Deployment event file doesn't exist: "${filePath}"`);
                return
            }
            let buffer = await fs.readFile(filePath);
            return outputEvent(loadJson(buffer));

        case EVENT_PUSH:
            core.info('Using push event');
            let fallback = {
                environment: core.getInput('fallback_environment', {required: true}),
                application: core.getInput('fallback_application', {required: true}),
                valuesFile: core.getInput('fallback_values_file', {required: true}),
                keyPaths: core.getInput('fallback_key_paths', {required: true}),
                value: core.getInput('fallback_push_sha', {required: true}),
            };
            return outputEvent(fallback);

        default:
            core.setFailed(`Unsupported Github Event "${process.env.GITHUB_EVENT_NAME}"`);
            return
    }
}

run().catch((err) => core.setFailed(err.toString()));
