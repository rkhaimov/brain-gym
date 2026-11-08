import { Buffer } from 'node:buffer';
import { basename } from 'node:path';

import { create, fromBinary, isFieldSet, toBinary } from '@bufbuild/protobuf';
import {
  CodeGeneratorRequestSchema,
  CodeGeneratorResponseSchema,
  FieldDescriptorProtoSchema,
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
} from '@bufbuild/protobuf/wkt';
import type {
  DescriptorProto,
  EnumDescriptorProto,
  FieldDescriptorProto,
  FileDescriptorProto,
  MethodDescriptorProto,
  ServiceDescriptorProto,
} from '@bufbuild/protobuf/wkt';

interface NamedMessage {
  readonly descriptor: DescriptorProto;
  readonly fullName: string;
  readonly typeName: string;
}

interface GeneratedFile {
  readonly content: string;
  readonly name: string;
}

function camelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_match, character: string) => character.toUpperCase());
}

function lowerFirst(value: string): string {
  return value.length === 0 ? value : value[0]?.toLowerCase() + value.slice(1);
}

function typeNameFromReference(typeName: string): string {
  return typeName.slice(typeName.lastIndexOf('.') + 1);
}

function generatedTypeName(typeName: string): string {
  return typeName.replaceAll('.', '_');
}

function collectMessages(
  descriptors: readonly DescriptorProto[],
  packageName: string,
  parents: readonly string[] = [],
): NamedMessage[] {
  return descriptors.flatMap((descriptor) => {
    const path = [...parents, descriptor.name];
    const typeName = generatedTypeName(path.join('.'));
    const fullName = [packageName, ...path].filter((part) => part.length > 0).join('.');
    return [
      { descriptor, fullName, typeName },
      ...collectMessages(descriptor.nestedType, packageName, path),
    ];
  });
}

function enumValueExpression(
  field: FieldDescriptorProto,
  enums: ReadonlyMap<string, EnumDescriptorProto>,
): string {
  const enumDescriptor = enums.get(field.typeName);
  const value = enumDescriptor?.value.find((candidate) => candidate.number !== 0);
  const fallback = enumDescriptor?.value[0];
  const selected = value ?? fallback;
  if (selected === undefined) {
    return '0';
  }
  const enumName = typeNameFromReference(field.typeName);
  const prefix = `${enumName.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase()}_`;
  const valueName = selected.name.startsWith(prefix)
    ? selected.name.slice(prefix.length)
    : selected.name;
  return `${enumName}.${valueName}`;
}

function scalarExpression(
  field: FieldDescriptorProto,
  messages: ReadonlyMap<string, NamedMessage>,
  enums: ReadonlyMap<string, EnumDescriptorProto>,
): string {
  switch (field.type) {
    case FieldDescriptorProto_Type.BOOL:
      return 'true';
    case FieldDescriptorProto_Type.BYTES:
      return 'new Uint8Array([1])';
    case FieldDescriptorProto_Type.DOUBLE:
    case FieldDescriptorProto_Type.FIXED32:
    case FieldDescriptorProto_Type.FLOAT:
    case FieldDescriptorProto_Type.INT32:
    case FieldDescriptorProto_Type.SFIXED32:
    case FieldDescriptorProto_Type.SINT32:
    case FieldDescriptorProto_Type.UINT32:
      return '1';
    case FieldDescriptorProto_Type.FIXED64:
    case FieldDescriptorProto_Type.INT64:
    case FieldDescriptorProto_Type.SFIXED64:
    case FieldDescriptorProto_Type.SINT64:
    case FieldDescriptorProto_Type.UINT64:
      return '1n';
    case FieldDescriptorProto_Type.ENUM:
      return enumValueExpression(field, enums);
    case FieldDescriptorProto_Type.MESSAGE: {
      const message = messages.get(field.typeName);
      return message === undefined ? 'undefined' : `create${message.typeName}Stub()`;
    }
    case FieldDescriptorProto_Type.STRING:
      return `'test-${field.jsonName}'`;
    case FieldDescriptorProto_Type.GROUP:
      return 'undefined';
    default:
      return 'undefined';
  }
}

function fieldExpression(
  field: FieldDescriptorProto,
  messages: ReadonlyMap<string, NamedMessage>,
  enums: ReadonlyMap<string, EnumDescriptorProto>,
): string {
  const value = scalarExpression(field, messages, enums);
  return field.label === FieldDescriptorProto_Label.REPEATED ? `[${value}]` : value;
}

function generateMessageFactory(
  message: NamedMessage,
  messages: ReadonlyMap<string, NamedMessage>,
  enums: ReadonlyMap<string, EnumDescriptorProto>,
): string {
  const fieldsOutsideOneofs = message.descriptor.field.filter(
    (field) =>
      !isFieldSet(field, FieldDescriptorProtoSchema.field.oneofIndex) || field.proto3Optional,
  );
  const fieldLines = fieldsOutsideOneofs.map((field) => {
    return `    ${field.jsonName}: ${fieldExpression(field, messages, enums)},`;
  });
  const oneofLines = message.descriptor.oneofDecl.flatMap((oneof, index) => {
    const selected = message.descriptor.field.find(
      (field) => field.oneofIndex === index && !field.proto3Optional,
    );
    if (selected === undefined) {
      return [];
    }
    const value = fieldExpression(selected, messages, enums);
    return [`    ${camelCase(oneof.name)}: { case: '${selected.jsonName}', value: ${value} },`];
  });

  return `export type ${message.typeName}StubOverrides = MessageInitShape<typeof ${message.typeName}Schema>;

export function create${message.typeName}Stub(
  overrides: ${message.typeName}StubOverrides = {},
): ${message.typeName} {
  return create(${message.typeName}Schema, {
${[...fieldLines, ...oneofLines].join('\n')}
    ...overrides,
  });
}`;
}

function generateRpcSpy(method: MethodDescriptorProto): string {
  const methodName = lowerFirst(method.name);
  const inputType = typeNameFromReference(method.inputType);
  const outputType = typeNameFromReference(method.outputType);
  const spyType = `${method.name}RpcSpy`;
  const defaultResponse = `create${outputType}Stub()`;

  return `export interface ${spyType} {
  readonly handler: Mock<(request: ${inputType}) => Promise<${outputType}>>;
  getLastRequest(): Promise<${inputType}>;
  rejects(error: ConnectError): void;
  resolves(value: ${outputType}): void;
}

function create${method.name}RpcSpy(): ${spyType} {
  const handler = vi.fn<(request: ${inputType}) => Promise<${outputType}>>(
    async () => ${defaultResponse},
  );

  return {
    handler,
    async getLastRequest() {
      let request: ${inputType} | undefined;
      await vi.waitFor(() => {
        const call = handler.mock.calls.at(-1);
        if (call === undefined) {
          throw new Error('${methodName} has not received a request');
        }
        request = call[0];
      });
      if (request === undefined) {
        throw new Error('${methodName} request was not captured');
      }
      return request;
    },
    rejects(error) {
      handler.mockRejectedValue(error);
    },
    resolves(value) {
      handler.mockResolvedValue(value);
    },
  };
}`;
}

function generateServiceMock(service: ServiceDescriptorProto): string {
  const serviceName = service.name;
  const propertyLines = service.method.map(
    (method) => `  readonly ${lowerFirst(method.name)}: ${method.name}RpcSpy;`,
  );
  const factoryLines = service.method.map(
    (method) => `    ${lowerFirst(method.name)}: create${method.name}RpcSpy(),`,
  );
  const handlerLines = service.method.map(
    (method) => `      ${lowerFirst(method.name)}: spies.${lowerFirst(method.name)}.handler,`,
  );

  return `${service.method.map((method) => generateRpcSpy(method)).join('\n\n')}

export interface ${serviceName}Spies {
${propertyLines.join('\n')}
}

export interface ${serviceName}Mock {
  readonly spies: ${serviceName}Spies;
  readonly transport: Transport;
}

export function create${serviceName}Mock(): ${serviceName}Mock {
  const spies: ${serviceName}Spies = {
${factoryLines.join('\n')}
  };
  const transport = createRouterTransport((router) => {
    router.service(${serviceName}, {
${handlerLines.join('\n')}
    });
  });
  return { spies, transport };
}`;
}

function enumDescriptors(file: FileDescriptorProto): Map<string, EnumDescriptorProto> {
  return new Map(
    file.enumType.map((descriptor) => [`.${file.package}.${descriptor.name}`, descriptor]),
  );
}

function generateFile(file: FileDescriptorProto): GeneratedFile {
  const messages = collectMessages(file.messageType, file.package);
  const messagesByName = new Map(messages.map((message) => [`.${message.fullName}`, message]));
  const enums = enumDescriptors(file);
  const messageTypeImports = messages.map((message) => message.typeName);
  const messageSchemaImports = messages.map((message) => `${message.typeName}Schema`);
  const enumImports = file.enumType.map((descriptor) => descriptor.name);
  const serviceImports = file.service.map((descriptor) => descriptor.name);
  const imports = [...messageSchemaImports, ...enumImports, ...serviceImports].sort();
  const moduleName = `./${basename(file.name, '.proto')}_pb.js`;
  const factories = messages.map((message) =>
    generateMessageFactory(message, messagesByName, enums),
  );
  const services = file.service.map((service) => generateServiceMock(service));
  const outputName = file.name.replace(/\.proto$/, '_test.ts');
  const content = `// @generated by protoc-gen-test. DO NOT EDIT.
import { create } from '@bufbuild/protobuf';
import type { MessageInitShape } from '@bufbuild/protobuf';
import { createRouterTransport } from '@connectrpc/connect';
import type { ConnectError, Transport } from '@connectrpc/connect';
import { vi } from 'vitest';
import type { Mock } from 'vitest';

import {
  ${imports.join(',\n  ')},
} from '${moduleName}';
import type {
  ${messageTypeImports.sort().join(',\n  ')},
} from '${moduleName}';

${factories.join('\n\n')}

${services.join('\n\n')}
`;

  return { content, name: outputName };
}

async function readStandardInput(): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }
  return Buffer.concat(chunks);
}

const request = fromBinary(CodeGeneratorRequestSchema, await readStandardInput());
const filesToGenerate = new Set(request.fileToGenerate);
const files = request.protoFile.filter((file) => filesToGenerate.has(file.name)).map(generateFile);
const response = create(CodeGeneratorResponseSchema, { file: files });
process.stdout.write(toBinary(CodeGeneratorResponseSchema, response));
