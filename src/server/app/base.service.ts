import { Model } from "mongoose";
import { BaseEntity } from "@app/base.entity";

export interface BaseReaderService {
  getAll(): Promise<BaseEntity[]>;
  getById(id: string): Promise<BaseEntity | null>;
  Query(filter: {}): Promise<BaseEntity[]>;
}

export interface BaseWriterService {
  create(data: BaseEntity): Promise<BaseEntity>;
  update(id: string, data: BaseEntity): Promise<BaseEntity | null>;
  remove(id: string): Promise<BaseEntity | null>;
}

export interface StateService {
  getCurrentState(): ServiceState,
  setCurrentState(state: ServiceState): void,
  resetState(): void,
  addError(error: string): void,
  addSuccess(message: string): void,
  getMessages(): string[];
  validateResult(): boolean;
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

  validateResult(): boolean {
    const currentState = this.getCurrentState();
    if (currentState != ServiceState.Invalid)
      this.setCurrentState(ServiceState.Valid);

    return this.getCurrentState() == ServiceState.Valid;
  }

  getMessages(): string[] {
    return this.messages;
  }

  async create(data: BaseEntity): Promise<BaseEntity> {
    return await data.save();
  }

  async update(id: string, data: BaseEntity): Promise<BaseEntity|null> {
    const found = await this.getById(id);
    if (!found) throw new Error('Data not found');

    return await this.entity.findOneAndUpdate({
      _id: id
    }, data, {
      upsert: false,
      new: false,
      multi: false
    });
  }

  async remove(id: string): Promise<BaseEntity | null> {
    const found = await this.getById(id);
    if (!found) throw new Error('Data not found');

    await this.entity.findOneAndDelete({
      _id: found._id
    }, {});
    return found;
  }

  async getAll(): Promise<BaseEntity[]> {
    return await this.entity.find({});
  }

  async getById(id: string): Promise<BaseEntity | null> {
    return await this.entity.findById(id);
  }

  async Query(filter: {}): Promise<BaseEntity[]> {
    return await this.entity.find(filter);
  }
}
