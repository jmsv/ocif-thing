import { writeFile } from "fs/promises";
import * as prettier from "prettier";

const dl = async (url: string) => {
  const response = await fetch(url);
  return await response.text();
};

const run = async () => {
  const schemas = {
    base: await dl(
      "https://raw.githubusercontent.com/ocwg/spec/refs/heads/main/spec/v0.5/schema.json"
    ),
    core: {
      rectNode: await dl(
        "https://raw.githubusercontent.com/ocwg/spec/refs/heads/main/spec/v0.5/core/rect-node.json"
      ),
      ovalNode: await dl(
        "https://raw.githubusercontent.com/ocwg/spec/refs/heads/main/spec/v0.5/core/oval-node.json"
      ),
      pathNode: await dl(
        "https://raw.githubusercontent.com/ocwg/spec/refs/heads/main/spec/v0.5/core/path-node.json"
      ),
    },
  };

  const output = `
// This file is generated by build-schema.ts
import Ajv from "ajv/dist/2020";
import type { FromSchema } from "json-schema-to-ts";

// Schemas

const schemas = {
  base: ${JSON.stringify(JSON.parse(schemas.base))} as const,
  core: {
    rectNode: ${JSON.stringify(JSON.parse(schemas.core.rectNode))} as const,
    ovalNode: ${JSON.stringify(JSON.parse(schemas.core.ovalNode))} as const,
    pathNode: ${JSON.stringify(JSON.parse(schemas.core.pathNode))} as const,
  } as const,
} as const;

// Types

export type OcifSchemaBase = FromSchema<typeof schemas.base>;

export type OcifSchemaCoreRect = FromSchema<typeof schemas.core.rectNode>;
export type OcifSchemaCoreOval = FromSchema<typeof schemas.core.ovalNode>;
export type OcifSchemaCorePath = FromSchema<typeof schemas.core.pathNode>;

// Validators

const ajv = new Ajv({ strict: false });

export const validateOcifBase = ajv.compile(schemas.base);
  `.trim();

  const outputFormatted = await prettier.format(output, {
    parser: "typescript",
  });
  await writeFile("src/ocif/schema.ts", outputFormatted);
};

run();
