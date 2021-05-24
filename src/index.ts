import { isMaster } from "cluster";
import { startCoordinator } from "./coordinator";
import { startWorker } from "./worker";

function startProcess() {
  if (isMaster) {
    return startCoordinator({ numberOfWorkers: 10 });
  } else {
    return startWorker();
  }
}

startProcess();
