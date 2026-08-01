import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "mark", "small", "sub", "sup",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "div", "span", "iframe",
];

const ALLOWED_ATTR = [
  "href", "target", "rel", "title",
  "src", "alt", "width", "height", "loading", "decoding",
  "class", "id", "style",
  "colspan", "rowspan",
  "allow", "allowfullscreen", "frameborder", "referrerpolicy",
];

/**
 * Editor output is authored by signed-in admins, but it is still stored and
 * replayed as HTML — sanitise it so a compromised account or pasted payload
 * cannot inject script into every reader's browser.
 */
export function sanitizeHtml(dirty: string) {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|#|\/)/i,
    ADD_TAGS: ["iframe"],
    FORBID_TAGS: ["script", "style", "form", "input", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "formaction"],
  });
}
