import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import PreviewBanner from "@/components/PreviewBanner";

/**
 * Draft-mode chrome (preview banner + visual editing overlays).
 *
 * draftMode() is a request-time read, so this lives behind <Suspense> in the
 * root layout — the layout itself stays prerenderable while this streams.
 */
export default async function DraftModeUI() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  return (
    <>
      <PreviewBanner />
      <VisualEditing />
    </>
  );
}
