[![Node.js CI](https://github.com/afharo/node-clustering/actions/workflows/main.yml/badge.svg)](https://github.com/afharo/node-clustering/actions/workflows/main.yml)

# node-clustering

Tests about how to best implement mission-specific workers with node `cluster`.

## Implemented use cases

### HTTP-focused only nodes with `@hapi/hapi`
The first implementation focuses only on adding a _simple_ piece of logic for the coordinator node (`isMaster === true`) to choose which worker will handle the incoming HTTP connections served by `@hapi/hapi`.

## How to run it

1. Install the dependencies:   
   ```shell
   npm i
   ```
2. Compile Typescript:
   ```shell
   npm run build
   ```
3. Start it:
   ```shell
   npm start
   ```
4. You'll see these logs:   
   ```shell
   [Coordinator] Server running at: http://elast-afharo.lan:3000
   [Worker] Server 19417 accepting requests
   [Worker] Server 19420 accepting requests
   ```
4. Open http://localhost:3000/ in your browser, and you'll notice that the requests are coming from the different workers registered in `http` mode because you'll get `Hello World from {PID}` where PID will match the ones logged above.

## Tests

I haven't implemented any unit tests yet for this code. PRs are welcomed :)
