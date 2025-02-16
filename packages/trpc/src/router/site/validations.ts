import { z } from 'zod';

export const SITE_PAGE_URL_VALIDATION = z
  .string({
    required_error: 'Notion page URL is required',
  })
  .superRefine((val, ctx) => {
    let url: URL;
    try {
      url = new URL(val);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid URL',
        fatal: true,
      });
      return z.NEVER;
    }
    if (url.hostname.endsWith(`.notion.so`)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `The Notion page isn't public, you need to share it to web first`,
        fatal: true,
      });
      return z.NEVER;
    }
    if (!url.hostname.endsWith(`.notion.site`)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid Notion URL, domain should be notion.site',
        fatal: true,
      });
      return z.NEVER;
    }
    const pageId = url.pathname.split('-').pop();
    if (!pageId || !/^[\da-z]+$/.test(pageId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid Notion URL, page ID is missing or invalid',
        fatal: true,
      });
      return z.NEVER;
    }
  });

export const SITE_NAME_VALIDATION = z
  .string()
  .min(1, 'Name is required')
  .max(190, 'Name is at most 190 characters');

export const SITE_SUBDOMAIN_VALIDATION = z
  .string()
  .min(3, 'Subdomain must contain at least 3 characters')
  .regex(
    /^[\da-z\-]+$/,
    'Subdomain can only contain lowercase letters, numbers and hyphens',
  );

export const SITE_DESCRIPTION_VALIDATION = z
  .string()
  .min(1, 'Description is required')
  .max(190, 'Description is at most 190 characters');

export const CREATE_INPUT_VALIDATION = z.object({
  name: SITE_NAME_VALIDATION,
  subdomain: SITE_SUBDOMAIN_VALIDATION,
  description: SITE_DESCRIPTION_VALIDATION,
  pageUrl: SITE_PAGE_URL_VALIDATION,
});

export const UPDATE_INPUT_VALIDATION = CREATE_INPUT_VALIDATION.extend({
  subdomain: z.string(),
});
