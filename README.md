# Deployment Details

This action will output the details of a deployment or push event. The intention is to use it
in a GitOps workflow for updating values in a yaml or json document.

## Usage:

The following action will execute on a `deployment` or `push` event.

```yaml
name: Deployment
on:
  deployment:
  push:
    branches:
      - master

jobs:
  deploy:
    name: Deployment
    runs-on: ubuntu-latest
    steps:
        uses: playstudios/action-github-deployment-details@v1
        with:
            application: test-app
            values_file: Manifests/test-app/values/trunk.yaml
            key_paths: webapi.image.tag,cdn.image.tag
        
            # During a push event, these values will be in the action's output
            push_environment: trunk
            push_value: ${{ github.sha }}
```

See [action.yaml](action.yml) for the action outputs.

### Push Events

For push events, the inputs will be copied directly to the outputs.

### Deployment Events

Send a deployment event using the Github API: https://developer.github.com/v3/repos/deployments/#create-a-deployment

Non-empty values from the
[deployment webhook](https://developer.github.com/v3/activity/events/types/#deploymentevent)
will overwrite those supplied via the action inputs. 

```yaml
environment: .environment
application: .payload.application
values_file: .payload.values_file
key_paths: .payload.key_paths
value: .sha
```
