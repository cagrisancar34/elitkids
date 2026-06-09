import config from "@payload-config";
import { NotFoundPage } from "@payloadcms/next/views";

import { importMap } from "../importMap.js";

type NotFoundArgs = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export default function NotFound({ params, searchParams }: NotFoundArgs) {
  return NotFoundPage({
    config: Promise.resolve(config),
    importMap,
    params,
    searchParams,
  });
}
