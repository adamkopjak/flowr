import { NextResponse } from "next/server";
import { FALLBACK_ARTICLES, type Article } from "@/lib/news";

export const revalidate = 300;

const FEEDS: { source: string; url: string }[] = [
  { source: "Cointelegraph", url: "https://cointelegraph.com/rss" },
  { source: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
  { source: "Decrypt", url: "https://decrypt.co/feed" },
];

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripHtml(s: string): string {
  return decodeEntities(s)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pickTag(name: string, block: string): string | null {
  const m = block.match(
    new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"),
  );
  return m ? decodeEntities(m[1]).trim() : null;
}

function pickAllTags(name: string, block: string): string[] {
  const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    const v = decodeEntities(m[1]).trim();
    if (v) out.push(v);
  }
  return out;
}

function pickAttr(name: string, block: string): string | null {
  // First self-closing or open tag like <media:content url="..."  ...>
  const re = new RegExp(`<${name}\\b[^>]*\\burl=("|')([^"']+)\\1`, "i");
  const m = block.match(re);
  return m ? decodeEntities(m[2]) : null;
}

function extractImage(block: string): string | null {
  // Prefer media:content, then media:thumbnail, then enclosure (image/* only),
  // and last resort: first <img src=...> in the description HTML.
  const mediaContent = pickAttr("media:content", block);
  if (mediaContent && /\.(jpe?g|png|webp|gif|avif)|image/i.test(mediaContent))
    return mediaContent;

  const mediaThumb = pickAttr("media:thumbnail", block);
  if (mediaThumb) return mediaThumb;

  const enclosureMatch = block.match(
    /<enclosure\b[^>]*\burl=("|')([^"']+)\1[^>]*\btype=("|')image\/[^"']+\3/i,
  );
  if (enclosureMatch) return decodeEntities(enclosureMatch[2]);

  const desc = block.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
  if (desc) {
    const imgMatch = decodeEntities(desc[1]).match(
      /<img\b[^>]*\bsrc=("|')([^"']+)\1/i,
    );
    if (imgMatch) return imgMatch[2];
  }
  return null;
}

function parseFeed(xml: string, source: string): Article[] {
  const items: Article[] = [];
  const itemRe = /<item[\s>][\s\S]*?<\/item>/gi;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[0];
    const title = pickTag("title", block);
    if (!title) continue;
    const link = pickTag("link", block);
    const description = pickTag("description", block) || "";
    const pubDate = pickTag("pubDate", block);
    const cats = pickAllTags("category", block).slice(0, 3);
    const ts = pubDate ? Date.parse(pubDate) : NaN;
    const minutesAgo = isNaN(ts)
      ? 0
      : Math.max(0, Math.round((Date.now() - ts) / 60000));
    items.push({
      id: `${source.toLowerCase().replace(/\s+/g, "-")}-${i++}`,
      source,
      url: link ? link.trim() : null,
      publishedAt: pubDate || null,
      minutesAgo,
      headline: stripHtml(title),
      snippet: stripHtml(description).slice(0, 360),
      tags: cats.map((c) => c.replace(/[<>]/g, "")).filter(Boolean),
      thumbnail: extractImage(block),
    });
  }
  return items;
}

async function fetchFeed(source: string, url: string): Promise<Article[]> {
  const r = await fetch(url, {
    headers: {
      accept: "application/rss+xml, application/xml, text/xml",
      "user-agent": "flowr/1.0 (+https://flowr.app)",
    },
    next: { revalidate: 300 },
  });
  if (!r.ok) throw new Error(`${source} http ${r.status}`);
  const xml = await r.text();
  return parseFeed(xml, source).slice(0, 10);
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      FEEDS.map((f) => fetchFeed(f.source, f.url)),
    );
    const merged: Article[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") merged.push(...r.value);
      else console.warn("[flowr/api/news] feed failed:", r.reason);
    }
    if (merged.length === 0) throw new Error("all feeds failed");

    merged.sort((a, b) => {
      const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return tb - ta;
    });

    return NextResponse.json({
      articles: merged.slice(0, 24),
      source: "live",
    });
  } catch (e) {
    console.warn(
      "[flowr/api/news] all RSS feeds unavailable, using fallback:",
      (e as Error).message,
    );
    return NextResponse.json({
      articles: FALLBACK_ARTICLES,
      source: "fallback",
    });
  }
}
