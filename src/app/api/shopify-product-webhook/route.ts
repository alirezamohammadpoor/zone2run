export const runtime = "edge";

export async function POST(request: Request) {
  console.log("🔔 Edge webhook received");

  try {
    // Clone request to read body
    const clonedRequest = request.clone();
    const text = await clonedRequest.text();

    console.log("Body length:", text.length);
    console.log("Body:", text.substring(0, 500));

    if (!text) {
      return new Response(JSON.stringify({ error: "Empty body" }), {
        status: 400,
      });
    }

    const payload = JSON.parse(text);

    console.log("Product ID:", payload.id);
    console.log("Title:", payload.title);
    console.log("Vendor:", payload.vendor);

    return new Response(
      JSON.stringify({
        success: true,
        productId: payload.id,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Failed" }), { status: 500 });
  }
}
