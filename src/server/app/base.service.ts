import { Model } from "mongoose";
import { BaseEntity } from "@app/base.entity";

export interface BaseReaderService {
  getAll(): Promise<BaseEntity[]>;
  getById(id: string): Promise<BaseEntity | null>;
}

export interface BaseWriterService {
  create(data: BaseEntity): Promise<BaseEntity>;
  update(id: string, data: BaseEntity): Promise<BaseEntity>;
  remove(id: string): Promise<BaseEntity>;
}

export interface StateService {
  getCurrentState(): ServiceState,
  setCurrentState(state: ServiceState): void,
  resetState(): void,
  addError(error: string): void,
  addSuccess(message: string): void,
  getMessages(): string[];
}

export const enum ServiceState {
  Undefined = -1,
  Invalid = 0,
  Valid = 1
}

export abstract class BaseService  implements
  StateService,
  BaseReaderService,
  BaseWriterService {
  constructor(protected entity: Model<any>) { }
  currentState: ServiceState = ServiceState.Undefined;
  messages: string[] = [];

  getCurrentState(): ServiceState {
    return this.currentState;
  }

  setCurrentState(state: ServiceState) {
    this.currentState = state;
  }

  resetState(): void {
    this.currentState = ServiceState.Undefined;
    this.messages = [];
  }

  addError(error: string): void {
    this.messages.push(error);
    this.currentState = ServiceState.Invalid;
  }

  addSuccess(message: string): void {
    this.messages.push(message);
    this.currentState = this.currentState != ServiceState.Invalid ?
      ServiceState.Valid : this.currentState;
  }

  getMessages(): string[] {
    return this.messages;
  }

  create(data: BaseEntity): Promise<BaseEntity> {
    throw new Error("Method not implemented.");
  }

  update(id: string, data: BaseEntity): Promise<BaseEntity> {
    throw new Error("Method not implemented.");
  }

  remove(id: string): Promise<BaseEntity> {
    throw new Error("Method not implemented.");
  }

  async getAll(): Promise<BaseEntity[]> {
    return await this.entity.find({});
  }

  async getById(id: string): Promise<BaseEntity | null> {
    return await this.entity.findById(id);
  }
}
