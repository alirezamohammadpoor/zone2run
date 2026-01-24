"use server";

import shopifyClient from "@/lib/client";

const CHECK_VARIANTS_AVAILABILITY = `
  query CheckVariantsAvailability($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        availableForSale
      }
    }
  }
`;

interface VariantNode {
  id: string;
  availableForSale: boolean;
}

interface CheckVariantsResponse {
  nodes: (VariantNode | null)[];
}

export async function checkCartAvailability(
  variantIds: string[]
): Promise<Record<string, boolean>> {
  if (variantIds.length === 0) return {};

  const data = await shopifyClient.request<CheckVariantsResponse>(
    CHECK_VARIANTS_AVAILABILITY,
    { ids: variantIds }
  );

  return data.nodes.reduce(
    (acc: Record<string, boolean>, node: VariantNode | null) => {
      if (node?.id) {
        acc[node.id] = node.availableForSale;
      }
      return acc;
    },
    {}
  );
}
