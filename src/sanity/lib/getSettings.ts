import { sanityFetch } from "./client";

interface NotFoundPage {
  title?: string;
  body?: string;
  image?: {
    asset: { url: string };
    alt?: string;
    hotspot?: { x: number; y: number };
  };
  buttons?: Array<{ text: string; link: string }>;
}

export async function getNotFoundPage(): Promise<NotFoundPage | null> {
  const query = `*[_type == "settings"][0].notFoundPage {
    title,
    body,
    image {
      asset-> { url },
      alt,
      hotspot
    },
    buttons[] {
      text,
      link
    }
  }`;

  try {
    return await sanityFetch<NotFoundPage | null>(query);
  } catch (error) {
    console.error("Error fetching 404 page settings:", error);
    return null;
  }
}

export type FooterLink = {
  label: string;
  url: string;
  isExternal?: boolean;
};

export type FooterColumn = {
  title?: string;
  links?: FooterLink[];
};

export type FooterNewsletter = {
  heading?: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
};

export type FooterSettings = {
  newsletter?: FooterNewsletter;
  column1?: FooterColumn;
  column2?: FooterColumn;
  column3?: FooterColumn;
  copyrightText?: string;
};

export async function getFooterSettings(): Promise<FooterSettings | null> {
  const query = `*[_type == "settings"][0].footer {
    newsletter {
      heading,
      placeholder,
      buttonText,
      successMessage
    },
    column1 {
      title,
      links[] {
        label,
        url,
        isExternal
      }
    },
    column2 {
      title,
      links[] {
        label,
        url,
        isExternal
      }
    },
    column3 {
      title,
      links[] {
        label,
        url,
        isExternal
      }
    },
    copyrightText
  }`;

  try {
    return await sanityFetch<FooterSettings | null>(query);
  } catch (error) {
    console.error("Error fetching footer settings:", error);
    return null;
  }
}
