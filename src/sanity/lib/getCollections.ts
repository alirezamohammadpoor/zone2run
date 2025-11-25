import { client } from "@/sanity/lib/client";

export async function getAllCollections() {
  const query = `*[_type == "collection"] | order(sortOrder asc, store.title asc) {
    _id,
    "title": store.title,
    "slug": store.slug {
      current
    },
    menuImage {
      asset-> {
        _id,
        url
      },
      alt
    },
    sortOrder
  }`;

  try {
    return await client.fetch(query);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

export async function getCollectionBySlug(slug: string) {
  const collectionQuery = `*[_type == "collection" && (store.slug.current == $slug || lower(store.slug.current) == lower($slug))][0]{
    _id,
    "title": store.title,
    "shopifyId": store.id,
    description,
    editorialImages[] {
      _key,
      image {
        asset-> {
          _id,
          url
        },
        alt
      },
      caption
    },
    "curatedProducts": curatedProducts[]-> {
      _id,
      "handle": coalesce(shopifyHandle, store.slug.current)
    }
  }`;

  const productsQuery = `*[_type == "product" && (references($collectionId) || (defined(shopifyCollectionIds) && $shopifyIdStr in shopifyCollectionIds))]{
    _id,
    "title": coalesce(title, store.title),
    "handle": coalesce(shopifyHandle, store.slug.current),
    "description": store.descriptionHtml,
    "vendor": store.vendor,
    "productType": store.productType,
    "tags": store.tags,
    "priceRange": {
      "minVariantPrice": store.priceRange.minVariantPrice,
      "maxVariantPrice": store.priceRange.maxVariantPrice
    },
    "mainImage": {
      "url": store.previewImageUrl,
      "alt": store.title
    },
    "options": store.options,
    "variants": store.variants[]-> {
      "id": store.gid,
      "title": store.title,
      "sku": store.sku,
      "price": store.price,
      "compareAtPrice": store.compareAtPrice,
      "available": store.inventory.isAvailable,
      "selectedOptions": [
        select(store.option1 != null => {"name": "Size", "value": store.option1}),
        select(store.option2 != null => {"name": "Color", "value": store.option2}),
        select(store.option3 != null => {"name": "Material", "value": store.option3})
      ]
    },
    category-> {
      _id,
      title,
      "slug": slug.current,
      categoryType,
      parentCategory-> {
        _id,
        title,
        "slug": slug.current
      }
    },
    brand-> {
      _id,
      name,
      logo {
        asset-> {
          url
        }
      }
    },
    gender,
    featured,
    "createdAt": store.createdAt
  }`;

  try {
    const collection = await client.fetch(collectionQuery, { slug });
    if (!collection) return null;

    const shopifyIdStr = collection.shopifyId
      ? collection.shopifyId.toString()
      : "";

    let products = await client.fetch(productsQuery, {
      collectionId: collection._id,
      shopifyIdStr: shopifyIdStr,
    });

    if ((!products || products.length === 0) && collection.shopifyId) {
      console.log(
        `⚠️ No products found for collection "${collection.title}" (Shopify ID: ${collection.shopifyId})`
      );
    }

    if (collection.curatedProducts && collection.curatedProducts.length > 0) {
      const curatedIds = new Map(
        collection.curatedProducts.map((p: any, idx: number) => [p._id, idx])
      );

      products.sort((a: any, b: any) => {
        const aInCurated = curatedIds.has(a._id);
        const bInCurated = curatedIds.has(b._id);

        if (aInCurated && bInCurated) {
          const aIdx = curatedIds.get(a._id) ?? 0;
          const bIdx = curatedIds.get(b._id) ?? 0;
          return Number(aIdx) - Number(bIdx);
        }
        if (aInCurated) return -1;
        if (bInCurated) return 1;

        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return Number(bDate) - Number(aDate);
      });
    } else {
      products.sort((a: any, b: any) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return Number(bDate) - Number(aDate);
      });
    }

    return {
      ...collection,
      products: products || [],
    };
  } catch (error) {
    console.error(`Error fetching collection ${slug}:`, error);
    return null;
  }
}

