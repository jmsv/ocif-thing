import Ajv from "ajv/dist/2020";
import { base } from "ocif-thing-schema";

const ajv = new Ajv({ strict: false });

export const validateOcifBase = ajv.compile(base);
