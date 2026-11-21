import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  // Registrar solo datos técnicos del error, sin consultas ni datos personales.
  const digest = error && typeof error === "object" && "digest" in error && typeof error.digest === "string" ? error.digest : null;
  console.error(JSON.stringify({ event: "request_error", digest, route: context.routePath, method: request.method, time: new Date().toISOString() }));
};
