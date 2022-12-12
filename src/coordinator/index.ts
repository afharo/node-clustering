import cluster from "cluster";
import type { Worker } from "cluster";
import { server as HapiServer } from "@hapi/hapi";
import type { ProtocolMessage, RunningMode } from "../protocol";
import { ProtocolMessageType } from "../protocol";

interface CoordinatorOptions {
  numberOfWorkers?: number;
}

export async function startCoordinator({
  numberOfWorkers,
}: CoordinatorOptions) {
  createWorkers(numberOfWorkers);
  await createHttpServer();
}

const workers = new Map<string, { worker: Worker; modes: RunningMode[] }>();

/**
 * Creates the workers and keeps them up and running.
 * @param numberOfWorkers
 */
function createWorkers(numberOfWorkers = 10) {
  while (workers.size < numberOfWorkers) {
    const worker = cluster.fork();
    const workerId = `${worker.id}`;
    workers.set(workerId, { worker, modes: ["*"] }); // By default all workers do all kind of tasks

    // Should we also handle `exit` and `close` events?
    worker.once("disconnect", () => {
      workers.delete(workerId);
      createWorkers(numberOfWorkers);
    });

    // Handle Messages according to the defined protocol
    worker.on("message", (message: ProtocolMessage) => {
      switch (message.type) {
        case ProtocolMessageType.RUNNING_MODE:
          const wkr = workers.get(workerId);
          if (wkr) {
            // if not found it's because it's dead already
            workers.set(workerId, {
              worker: wkr.worker,
              modes: message.meta.modes,
            });
          }
          break;
        default:
          console.log(
            `Message ${message.type} received: ${JSON.stringify(message)}`
          );
      }
    });
  }
}

/**
 * Gets a random number where 0 <= x < max
 * @param max The maximum (not included) number in the range
 */
function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

/**
 * This piece of logic should be as fast as possible to minimize the overhead of choosing which worker will reply.
 */
function getHttpWorker() {
  const httpWorkers: Worker[] = [];
  // Select only the http-capable workers
  workers.forEach(({ worker, modes }) => {
    if (modes.includes("http") || modes.includes("*")) {
      httpWorkers.push(worker);
    }
  });
  // For this test, we are simply picking a random one. However, this piece of logic can (and should) be improved to
  // follow other approaches: random, round-robin, least-loaded, sticky-session.
  const workerPosition = getRandomInt(httpWorkers.length);
  return httpWorkers[workerPosition];
}

async function createHttpServer() {
  const server = HapiServer({ port: 3000 });

  // Listens to every incoming socket so it can redirect it to the specific workers
  server.listener.on("connection", (socket) => {
    // 1. Need to pause it in order to send it to the worker
    socket.pause();
    // 2. Pick the worker that will handle the request
    const worker = getHttpWorker();
    // 3. Send the socket to the worker
    worker.send("http-connection", socket);
  });

  await server.start();
  console.info("[Coordinator] Server running at:", server.info.uri);
}
