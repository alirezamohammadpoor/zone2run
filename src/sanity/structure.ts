import type { StructureResolver } from "sanity/structure";

import homeStructure from "./homeStructure";
import menuStructure from "./menuStructure";
import collectionStructure from "./collectionStructure";
import productStructure from "./productStructure";
import pageStructure from "./pageStructure";
import colorThemeStructure from "./colorThemeStructure";
import settingStructure from "./settingStructure";
import siteSettingsStructure from "./siteSettingsStructure";
import { brandStructure } from "./brandStructure";
import { categoryStructure } from "./categoryStructure";
import { blogStructure } from "./blogStructure";
import { homepageVersionStructure } from "./homepageVersionStructure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Content")
    .items([
      siteSettingsStructure(S, context),
      S.divider(),
      homeStructure(S, context),
      homepageVersionStructure(S),
      menuStructure(S, context),
      collectionStructure(S, context),
      productStructure(S, context),
      brandStructure(S),
      categoryStructure(S),
      blogStructure(S),
      pageStructure(S, context),
      colorThemeStructure(S, context),
      settingStructure(S, context),
    ]);
