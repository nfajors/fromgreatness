import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { getUserFromRequest } from "./lib/session-helper";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
  ipAddress?: string;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ipAddress =
    opts.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    opts.req.headers.get("x-real-ip") ||
    undefined;
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders, ipAddress };
  try {
    ctx.user = await getUserFromRequest(opts.req.headers);
  } catch {
    // Authentication is optional; unauthenticated requests proceed with no user.
  }
  return ctx;
}
