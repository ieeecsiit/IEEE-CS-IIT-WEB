import type { AdminContext } from "../../_lib/env";
import { json } from "../../_lib/http";

/** GET /api/admin/me: who is signed in. */
export const onRequestGet = ({ data }: AdminContext) => json({ email: data.email });
