export enum MessageStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  UNDELIVERABLE = 'undeliverable',
  BLOCKED = 'blocked',
}

export const MESSAGE_STATUS_VALUES = [
  MessageStatus.PENDING,
  MessageStatus.SUCCESS,
  MessageStatus.UNDELIVERABLE,
  MessageStatus.BLOCKED,
] as const;
