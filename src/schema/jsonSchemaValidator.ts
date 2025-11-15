import Ajv from "ajv";
import addFormats from "ajv-formats";

export function createValidator(schema: object) {
  const ajv = new Ajv({
    allErrors: true,
    strict: true,
    allowUnionTypes: true
  });

  addFormats(ajv);

  return ajv.compile(schema);
}
