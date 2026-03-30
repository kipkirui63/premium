import { useEffect } from "react";

type MetaDefinition = {
  name?: string;
  property?: string;
  content: string;
};

interface SeoProps {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  noindex?: boolean;
  schema?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://marketplace.crispai.ca").replace(/\/$/, "");
const DEFAULT_IMAGE = `${SITE_URL}/lovable-uploads/4db0eac4-a39c-4fac-9775-eed8e9a4bebb.png`;

const upsertMetaTag = ({ name, property, content }: MetaDefinition) => {
  const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    if (name) element.name = name;
    if (property) element.setAttribute("property", property);
    document.head.appendChild(element);
  }

  element.content = content;
};

const upsertLinkTag = (rel: string, href: string) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
};

const Seo = ({
  title,
  description,
  canonicalPath = "/marketplace",
  image = DEFAULT_IMAGE,
  noindex = false,
  schema,
}: SeoProps) => {
  useEffect(() => {
    const fullTitle = `${title} | CrispAI Marketplace`;
    const canonicalUrl = canonicalPath.startsWith("http")
      ? canonicalPath
      : `${SITE_URL}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;

    document.title = fullTitle;
    upsertMetaTag({ name: "description", content: description });
    upsertMetaTag({ name: "robots", content: noindex ? "noindex, nofollow" : "index, follow" });
    upsertMetaTag({ property: "og:title", content: fullTitle });
    upsertMetaTag({ property: "og:description", content: description });
    upsertMetaTag({ property: "og:type", content: "website" });
    upsertMetaTag({ property: "og:url", content: canonicalUrl });
    upsertMetaTag({ property: "og:image", content: image });
    upsertMetaTag({ name: "twitter:card", content: "summary_large_image" });
    upsertMetaTag({ name: "twitter:title", content: fullTitle });
    upsertMetaTag({ name: "twitter:description", content: description });
    upsertMetaTag({ name: "twitter:image", content: image });
    upsertLinkTag("canonical", canonicalUrl);

    const schemaId = "page-schema";
    const existingSchema = document.getElementById(schemaId);
    if (existingSchema) {
      existingSchema.remove();
    }

    if (schema) {
      const script = document.createElement("script");
      script.id = schemaId;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    return () => {
      const schemaNode = document.getElementById(schemaId);
      if (schemaNode) {
        schemaNode.remove();
      }
    };
  }, [canonicalPath, description, image, noindex, schema, title]);

  return null;
};

export default Seo;
