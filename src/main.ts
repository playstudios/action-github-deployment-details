import * as core from '@actions/core';
import {PathLike, promises as fs} from 'fs';

interface githubDeploymentPayload {
    application?: string,
    values_file?: string,
    key_paths?: string,
}

interface githubDeployment {
    deployment: {
        sha: string,
        environment: string,
        payload?: githubDeploymentPayload,
    }
}

export interface eventDetails {
    environment: string,
    application: string,
    valuesFile: string,
    keyPaths: string,
    value: string,
}

const EVENT_DEPLOYMENT = 'deployment';
const EVENT_PUSH = 'push';

async function loadJsonFromFile(filePath: PathLike): Promise<Buffer> {
    if (!await fs.stat(filePath)) {
        throw new Error(`Deployment event file doesn't exist: "${filePath}"`);
    }
    return await fs.readFile(filePath);
}

function parseDeploymentJson(buffer: Buffer): eventDetails {
    let event = <githubDeployment>JSON.parse(buffer.toString());
    return <eventDetails>{
        environment: event.deployment.environment,
        application: event.deployment.payload?.application || '',
        valuesFile: event.deployment.payload?.values_file || '',
        keyPaths: event.deployment.payload?.key_paths || '',
        value: event.deployment.sha || '',
    }
}

export function merge(...events: eventDetails[]): eventDetails {
    let event = <eventDetails>{};
    events.forEach((e) => {
        Object.entries(e).forEach(([key, value]) => {
            event[key] = value.toString().length > 0 ? value.toString() : event[key];
        });
    });
    return event;
}

function outputEvent(event: eventDetails) {
    core.setOutput('environment', event.environment);
    core.setOutput('application', event.application);
    core.setOutput('values_file', event.valuesFile);
    core.setOutput('key_paths', event.keyPaths);
    core.setOutput('value', event.value);
}

async function run() {
    let event = <eventDetails>{
        application: core.getInput('application'),
        valuesFile: core.getInput('values_file'),
        keyPaths: core.getInput('key_paths'),
    };

    switch (process.env.GITHUB_EVENT_NAME) {
        case EVENT_DEPLOYMENT:
            core.info('Using deployment event');
            let filePath = process.env.GITHUB_EVENT_PATH || '';
            let buffer = await loadJsonFromFile(filePath);
            event = merge(event, parseDeploymentJson(buffer));
            break;

        case EVENT_PUSH:
            core.info('Using push event');
            event = merge(event, <eventDetails>{
                environment: core.getInput('push_environment'),
                value: core.getInput('push_value')
            });
            break;

        default:
            throw new Error(`Unsupported Github Event "${process.env.GITHUB_EVENT_NAME}"`);
    }

    outputEvent(event);
}

if (process.env.GITHUB_ACTIONS) {
    run().catch((err) => core.setFailed(err.toString()));
}
