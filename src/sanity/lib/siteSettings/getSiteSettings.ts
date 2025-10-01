import { sanityFetch } from "../live";

interface SanityImage {
  asset: {
    _id: string;
    _type: string;
    url: string;
  };
  alt?: string;
}

interface SiteSettings {
  title: string;
  description: string;
  headerLogo: SanityImage;
  mainHeroImage: SanityImage;
  logo: SanityImage;
}

const siteSettingsQuery = `*[_type == "siteSettings"][0]{
...,
  headerLogo {
    asset->{
      _id,
      _type,
      url
    },
    alt
  },
  mainHeroImage {
    asset->{
      _id,
      _type,
      url
    },
    alt
  },
  logo {
asset->{
      _id,
      _type,
url
},
    alt
  }
}`;

export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await sanityFetch(siteSettingsQuery);
  return data as SiteSettings;
}
