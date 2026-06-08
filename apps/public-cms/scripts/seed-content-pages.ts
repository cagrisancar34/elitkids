import config from "../src/payload.config.ts";
import { getFallbackSitePages } from "../src/lib/sitePages.ts";
import { getPayload } from "payload";

const payload = await getPayload({ config });
const pages = getFallbackSitePages();

for (const page of pages) {
  const existing = await payload.find({
    collection: "site-pages",
    limit: 1,
    where: {
      slug: {
        equals: page.slug,
      },
    },
  });

  if (existing.docs.length) {
    console.log(`Atlandı: ${page.title}`);
    continue;
  }

  const data = { ...page };
  delete (data as Partial<typeof page>).createdAt;
  delete (data as Partial<typeof page>).id;
  delete (data as Partial<typeof page>).updatedAt;

  await payload.create({
    collection: "site-pages",
    data,
    draft: false,
  });
  console.log(`Oluşturuldu: ${page.title}`);
}

process.exit(0);
