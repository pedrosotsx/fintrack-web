import { z } from "zod";

function emptyNumberToUndefined(value: unknown) {
  if (value === "" || (typeof value === "number" && Number.isNaN(value))) {
    return undefined;
  }

  return value;
}

export function requiredPositiveNumber(requiredMessage: string, positiveMessage: string) {
  return z.preprocess(
    emptyNumberToUndefined,
    z.number({ error: requiredMessage }).positive(positiveMessage)
  );
}

export function requiredNonNegativeNumber(requiredMessage: string, minMessage: string) {
  return z.preprocess(
    emptyNumberToUndefined,
    z.number({ error: requiredMessage }).min(0, minMessage)
  );
}

export function requiredPositiveInteger(requiredMessage: string) {
  return z.preprocess(
    emptyNumberToUndefined,
    z.number({ error: requiredMessage }).int(requiredMessage).positive(requiredMessage)
  );
}
