import type { Metadata } from "next";
import config from "@payload-config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";

import { importMap } from "../importMap.js";

type PageArgs = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

export function generateMetadata({ params, searchParams }: PageArgs): Promise<Metadata> {
  return generatePageMetadata({
    config: Promise.resolve(config),
    params,
    searchParams,
  });
}

export default function Page({ params, searchParams }: PageArgs) {
  return RootPage({
    config: Promise.resolve(config),
    importMap,
    params,
    searchParams,
  });
}
