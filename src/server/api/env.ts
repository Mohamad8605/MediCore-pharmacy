// Works in both Vite (import.meta.env) and Node (process.env) contexts
export function getEnvVar(name: string): string | undefined {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[name]) {
    return import.meta.env[name] as string;
  }
  return process.env[name];
}
