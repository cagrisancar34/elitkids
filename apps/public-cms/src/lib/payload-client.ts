import "server-only";

import config from "@payload-config";
import { getPayload } from "payload";
import { cache } from "react";

export const getPublicCmsPayload = cache(async () => getPayload({ config }));
