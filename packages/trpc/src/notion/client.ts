import { NotionAPI } from 'notion-client';

declare global {
  // eslint-disable-next-line no-var
  var _notionClient: NotionAPI | undefined;
}

export const notion =
  global._notionClient ||
  new NotionAPI({
    // apiBaseUrl: process.env.NOTION_API_BASE_URL,
  });

// Reuse the same instance in dev to fix API error
if (process.env.NODE_ENV !== 'production') {
  global._notionClient = notion;
}
