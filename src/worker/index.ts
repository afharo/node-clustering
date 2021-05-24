import type { Socket } from "net";
import { server as HapiServer } from "@hapi/hapi";
import type { ProtocolMessage, RunningMode } from "../protocol";
import { ProtocolMessageType } from "../protocol";

export async function startWorker() {
  if (Math.random() < 0.2) {
    // for the test, only 20% of the nodes will listen to HTTP connections
    await createHttpServer();
    // registers itself as http mode
    notifyRunningMode(["http"]);
  } else {
    // Registers itself as something else
    notifyRunningMode(["other_features"]);
  }
}

function notifyRunningMode(modes: RunningMode[]) {
  const msg: ProtocolMessage = {
    type: ProtocolMessageType.RUNNING_MODE,
    meta: {
      modes,
    },
  };
  process.send!(msg); // send is optional because it's only available in child and forked nodes
}

function createHttpServer() {
  const server = HapiServer({
    port: 3000,
  });
  process.on(
    "message",
    (message: ProtocolMessage | string, socket?: Socket) => {
      if (message === "http-connection" && socket) {
        server.listener.emit("connection", socket); // push the connection event to the http server
      }
    }
  );

  server.route({
    path: "/",
    method: "GET",
    handler: (req, res) => {
      return res.response(`Hello World from ${process.pid}`);
    },
  });

  return server
    .initialize() // Calling initialize instead of start because we don't actually want to listen to the port
    .then(() =>
      console.info(`[Worker] Server ${process.pid} accepting requests`)
    );
}
