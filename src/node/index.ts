import { exec } from "node:child_process";
import { join } from "node:path";
import express, { type Express, type Response } from "express";
import { Either } from "../Either";

import { schemas } from "../schemas";
import { Schema } from "../types";
import {
  createRepositoryFromSchema,
  type RepositoryError,
  type RepositoryId,
} from "./createRepositoryFromSchema";

const app = express();
const port = 6006;

app.use(express.json());

for (const schema of schemas) {
  attachAPI(app, schema);
}

const distDir = join(process.cwd(), "dist");

app.use(express.static(distDir));
app.get("/", (_request, response) => response.sendFile(join(distDir, "index.html")));

const server = app.listen(port, () => {
  const url = `http://localhost:${port}`;

  console.log(`CRUD API and UI listening on ${url}`);

  exec(`cmd /c start "" "${url}"`);
});

setTimeout(() => {}, 60 * 60_000);

function attachAPI(app: Express, model: Schema): void {
  const repositoryResult = createRepositoryFromSchema(model.name, model.schema);

  if (Either.isLeft(repositoryResult)) {
    throw new Error(JSON.stringify(repositoryResult.value));
  }

  const repository = repositoryResult.value;
  const basePath = `/api/${model.name}`;

  app.get(basePath, async (_request, response) => sendResult(response, await repository.getAll()));

  app.get(`${basePath}/:id`, async (request, response) =>
    sendResult(response, await repository.getById(request.params.id as RepositoryId)),
  );

  app.post(basePath, async (request, response) =>
    sendResult(response, await repository.create(request.body)),
  );

  app.put(`${basePath}/:id`, async (request, response) =>
    sendResult(response, await repository.update(request.params.id as RepositoryId, request.body)),
  );

  app.delete(`${basePath}/:id`, async (request, response) =>
    sendResult(response, await repository.delete(request.params.id as RepositoryId)),
  );
}

function sendResult(response: Response, result: Either<RepositoryError, unknown>): void {
  if (Either.isLeft(result)) {
    response.status(400).json(result.value);
  } else {
    response.status(200).json(result.value ?? null);
  }
}
