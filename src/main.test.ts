import {eventDetails, merge} from './main';

describe('merge', () => {
    interface mergeTest {
        name: string,
        inputs: eventDetails[],
        output: eventDetails,
    }

    const tests = <mergeTest[]>[
        {
            name: 'overwrites defaults',
            inputs: [
                <eventDetails>{
                    application: 'test-app',
                    valuesFile: 'manifests/test-app/trunk.yaml',
                    keyPaths: 'api.image.tag',
                },
                <eventDetails>{
                    environment: 'trunk',
                    value: 'abc123',
                }
            ],
            output: <eventDetails>{
                application: 'test-app',
                valuesFile: 'manifests/test-app/trunk.yaml',
                keyPaths: 'api.image.tag',
                environment: 'trunk',
                value: 'abc123',
            }
        },
        {
            name: 'does not overwrite with empty values',
            inputs: [
                <eventDetails>{
                    application: 'test-app',
                    valuesFile: 'manifests/test-app/trunk.yaml',
                    keyPaths: 'api.image.tag',
                },
                <eventDetails>{
                    application: '',
                    environment: 'trunk',
                    value: 'abc123',
                }
            ],
            output: <eventDetails>{
                application: 'test-app',
                valuesFile: 'manifests/test-app/trunk.yaml',
                keyPaths: 'api.image.tag',
                environment: 'trunk',
                value: 'abc123',
            }
        },
        {
            name: 'overwrites in order',
            inputs: [
                <eventDetails>{
                    application: 'test-app',
                    valuesFile: 'manifests/test-app/trunk.yaml',
                    keyPaths: 'api.image.tag',
                },
                <eventDetails>{
                    application: '',
                    environment: 'trunk',
                    value: 'abc123',
                },
                <eventDetails>{
                    keyPaths: 'api.image.tag,cdn.image.tag',
                },
            ],
            output: <eventDetails>{
                application: 'test-app',
                valuesFile: 'manifests/test-app/trunk.yaml',
                keyPaths: 'api.image.tag,cdn.image.tag',
                environment: 'trunk',
                value: 'abc123',
            }
        }
    ];

    tests.forEach((t) => {
        test(t.name, () => {
            expect(merge(...t.inputs)).toStrictEqual(t.output);
        });
    });
});
