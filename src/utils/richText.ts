const IMAGE_BLOCK = /^\[\[image:(https?:\/\/[^\]|]+)(?:\|([^\]]*))?\]\]$/;

const ALLOWED_TAGS = new Set([
  "P",
  "BR",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "H2",
  "H3",
  "UL",
  "OL",
  "LI",
  "SPAN",
  "FONT",
  "FIGURE",
  "FIGCAPTION",
  "IMG",
  "A",
  "DIV",
]);

const ALLOWED_COLORS = new Set([
  "#e8ddd0",
  "#c9a87c",
  "#c4b89e",
  "#a86f52",
  "#78917c",
  "#7695ad",
  "rgb(232, 221, 208)",
  "rgb(201, 168, 124)",
  "rgb(196, 184, 158)",
  "rgb(168, 111, 82)",
  "rgb(120, 145, 124)",
  "rgb(118, 149, 173)",
]);

export function toRichTextHtml(content: string) {
  if (!content.trim()) return "";
  if (/<\/?[a-z][\s\S]*>/i.test(content)) return sanitizeRichText(content);

  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const image = block.match(IMAGE_BLOCK);
      if (image) {
        return `<figure><img src="${escapeAttribute(image[1])}" alt="${escapeAttribute(image[2] || "")}">${image[2] ? `<figcaption>${escapeHtml(image[2])}</figcaption>` : ""}</figure>`;
      }
      return `<p>${escapeHtml(block).replaceAll("\n", "<br>")}</p>`;
    })
    .join("");
}

export function sanitizeRichText(content: string) {
  if (typeof DOMParser === "undefined") return content;

  const document = new DOMParser().parseFromString(`<div>${content}</div>`, "text/html");
  const root = document.body.firstElementChild;
  if (!root) return "";

  sanitizeChildren(root);
  return root.innerHTML;
}

export function richTextWordCount(content: string) {
  if (!content.trim()) return 0;
  if (typeof DOMParser === "undefined") {
    return content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  }

  const document = new DOMParser().parseFromString(content, "text/html");
  return (document.body.textContent || "").trim().split(/\s+/).filter(Boolean).length;
}

function sanitizeChildren(parent: Element) {
  for (const child of [...parent.children]) {
    if (!ALLOWED_TAGS.has(child.tagName)) {
      sanitizeChildren(child);
      child.replaceWith(...child.childNodes);
      continue;
    }

    sanitizeElement(child);
    sanitizeChildren(child);
  }
}

function sanitizeElement(element: Element) {
  const tagName = element.tagName;
  const source = element.getAttribute("src") || "";
  const alt = element.getAttribute("alt") || "";
  const href = element.getAttribute("href") || "";
  const color =
    element instanceof HTMLElement
      ? element.style.color || element.getAttribute("color") || ""
      : "";

  for (const attribute of [...element.attributes]) {
    element.removeAttribute(attribute.name);
  }

  if (tagName === "IMG" && /^https?:\/\//i.test(source)) {
    element.setAttribute("src", source);
    element.setAttribute("alt", alt);
    element.setAttribute("loading", "lazy");
  }

  if (
    tagName === "A" &&
    (/^https?:\/\//i.test(href) || /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(href))
  ) {
    element.setAttribute("href", href);
    element.setAttribute("target", "_blank");
    element.setAttribute("rel", "noopener noreferrer");
  }

  if ((tagName === "SPAN" || tagName === "FONT") && ALLOWED_COLORS.has(color)) {
    element.setAttribute("style", `color: ${color}`);
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value);
}
