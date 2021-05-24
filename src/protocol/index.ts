export enum ProtocolMessageType {
  RUNNING_MODE,
}

export interface BaseProtocolMessage {
  type: ProtocolMessageType;
  meta: unknown;
}

export type RunningMode = "*" | "http" | string;

export interface ProtocolMessageRunningMode extends BaseProtocolMessage {
  type: ProtocolMessageType.RUNNING_MODE;
  meta: {
    modes: RunningMode[];
  };
}
export type ProtocolMessage = ProtocolMessageRunningMode;
