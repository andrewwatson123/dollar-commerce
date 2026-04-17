/**
 * Minimal HTML → Sanity Portable Text converter for Substack posts.
 *
 * Handles: <p>, <h1>-<h4>, <ul>/<ol>/<li>, <blockquote>, <strong>/<b>,
 * <em>/<i>, <a href>, <img>. Unknown tags fall through as plain text.
 *
 * Inline images are uploaded via the `uploadImage` callback and become
 * Portable Text image blocks interleaved with prose.
 *
 * This is intentionally small — enough to faithfully migrate the Substack
 * archive. Anything weirder, fix by hand in Studio.
 */

import * as cheerio from 'cheerio';

const randomKey = () => Math.random().toString(36).slice(2, 14);

function textBlock(style, children, listItem = null) {
  const block = {
    _type: 'block',
    _key: randomKey(),
    style,
    markDefs: [],
    children: children.length ? children : [{ _type: 'span', _key: randomKey(), text: '', marks: [] }],
  };
  if (listItem) {
    block.listItem = listItem;
    block.level = 1;
  }
  return block;
}

function walkInline($, el, marks = [], markDefs = []) {
  const spans = [];
  $(el)
    .contents()
    .each((_, node) => {
      if (node.type === 'text') {
        const text = node.data.replace(/\s+/g, ' ');
        if (text.trim() === '' && spans.length === 0) return;
        spans.push({ _type: 'span', _key: randomKey(), text, marks: [...marks] });
      } else if (node.type === 'tag') {
        const tag = node.name.toLowerCase();
        if (tag === 'br') {
          spans.push({ _type: 'span', _key: randomKey(), text: '\n', marks: [...marks] });
        } else if (tag === 'strong' || tag === 'b') {
          spans.push(...walkInline($, node, [...marks, 'strong'], markDefs));
        } else if (tag === 'em' || tag === 'i') {
          spans.push(...walkInline($, node, [...marks, 'em'], markDefs));
        } else if (tag === 'a') {
          const href = $(node).attr('href');
          if (href) {
            const key = randomKey();
            markDefs.push({ _type: 'link', _key: key, href });
            spans.push(...walkInline($, node, [...marks, key], markDefs));
          } else {
            spans.push(...walkInline($, node, marks, markDefs));
          }
        } else {
          spans.push(...walkInline($, node, marks, markDefs));
        }
      }
    });
  return spans;
}

export async function htmlToBlocks(html, uploadImage) {
  const $ = cheerio.load(`<div id="__root">${html}</div>`);
  const root = $('#__root');
  const blocks = [];

  const pushTextBlock = (el, style, listItem = null) => {
    const markDefs = [];
    const children = walkInline($, el, [], markDefs);
    if (children.length === 0) return;
    const block = textBlock(style, children, listItem);
    block.markDefs = markDefs;
    blocks.push(block);
  };

  const walkQueue = root.children().toArray();
  for (const node of walkQueue) {
    const tag = node.name?.toLowerCase();
    if (!tag) continue;

    if (tag === 'p') {
      // Check if it's just an image wrapper
      const imgs = $(node).find('img').toArray();
      if (imgs.length > 0 && $(node).text().trim() === '') {
        for (const img of imgs) {
          const src = $(img).attr('src');
          const alt = $(img).attr('alt') || '';
          const asset = await uploadImage(src);
          if (asset) blocks.push({ ...asset, _key: randomKey(), alt });
        }
      } else {
        pushTextBlock(node, 'normal');
      }
    } else if (/^h[1-6]$/.test(tag)) {
      const level = Math.min(Number(tag[1]) + 1, 4); // h1 → h2
      pushTextBlock(node, `h${Math.min(level, 3)}`);
    } else if (tag === 'blockquote') {
      pushTextBlock(node, 'blockquote');
    } else if (tag === 'ul' || tag === 'ol') {
      const listType = tag === 'ol' ? 'number' : 'bullet';
      $(node)
        .children('li')
        .each((_, li) => pushTextBlock(li, 'normal', listType));
    } else if (tag === 'img') {
      const src = $(node).attr('src');
      const alt = $(node).attr('alt') || '';
      const asset = await uploadImage(src);
      if (asset) blocks.push({ ...asset, _key: randomKey(), alt });
    } else if (tag === 'figure') {
      const img = $(node).find('img').first();
      if (img.length) {
        const src = img.attr('src');
        const alt = img.attr('alt') || '';
        const asset = await uploadImage(src);
        if (asset) {
          const caption = $(node).find('figcaption').text().trim();
          blocks.push({ ...asset, _key: randomKey(), alt, caption });
        }
      }
    } else if (tag === 'div') {
      // Substack wraps lots of things in divs — recurse
      const inner = await htmlToBlocks($(node).html() || '', uploadImage);
      blocks.push(...inner);
    } else {
      pushTextBlock(node, 'normal');
    }
  }

  return blocks;
}
