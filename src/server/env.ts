import { randomUUID } from 'node:crypto';

export interface EnvService {
  now(): Date;
  randomUUID(): string;
}

export const productionEnv: EnvService = {
  now: () => new Date(),
  randomUUID,
};
