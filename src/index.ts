import cluster from "cluster";
import { startCoordinator } from "./coordinator";
import { startWorker } from "./worker";

function startProcess() {
  if (cluster.isPrimary) {
    return startCoordinator({ numberOfWorkers: 10 });
  } else {
    return startWorker();
  }
}

startProcess();
