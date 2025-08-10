import React, { useEffect } from "react";

interface SeoProps {
  title: string;
  description?: string;
  canonical?: string;
}

const ensureMetaTag = (name: string, content: string) => {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const ensureLinkTag = (rel: string, href: string) => {
  if (!href) return;
  let tag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
};

export const Seo: React.FC<SeoProps> = ({ title, description = "", canonical }) => {
  useEffect(() => {
    document.title = title;
    ensureMetaTag("description", description);
    const url = canonical || window.location.href;
    ensureLinkTag("canonical", url);
  }, [title, description, canonical]);

  return null;
};

export default Seo;
