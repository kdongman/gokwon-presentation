import type { MetadataRoute } from "next";

const publicRoutes = ["/", "/home", "/home/menu", "/custom-order"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map((path, index) => ({
    url: new URL(path, "https://example.com").toString(),
    lastModified,
    changeFrequency: index === 0 ? "daily" : "weekly",
    priority: index === 0 ? 1 : 0.8,
  }));
}
