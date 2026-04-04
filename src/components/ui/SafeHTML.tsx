"use client";
import DOMPurify from "dompurify";

interface SafeHTMLProps {
  html: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export default function SafeHTML({ html, className, as: Tag = "div" }: SafeHTMLProps) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li",
      "h1", "h2", "h3", "h4", "h5", "h6", "span", "div", "img",
      "table", "thead", "tbody", "tr", "td", "th", "blockquote",
      "code", "pre", "hr", "sup", "sub", "section", "article",
      "header", "footer", "nav", "figure", "figcaption",
      "video", "source", "iframe",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "src", "alt", "class", "style", "id",
      "width", "height", "colspan", "rowspan", "type", "controls",
      "autoplay", "loop", "muted", "poster", "loading", "decoding",
      "allow", "allowfullscreen", "frameborder",
    ],
    ALLOW_DATA_ATTR: true,
  });

  return <Tag className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
