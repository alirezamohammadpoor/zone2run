import { vi, beforeEach } from "vitest";

// Mock the Shopify GraphQL client — prevents module-level env var throws
vi.mock("@/lib/client", () => ({
  default: { request: vi.fn() },
}));

// Mock Shopify cart functions — prevents real API calls from queueMicrotask callbacks
vi.mock("@/lib/shopify/cart", () => ({
  createCart: vi.fn().mockResolvedValue(null),
  addToCart: vi.fn().mockResolvedValue({ success: false }),
  updateCartQuantity: vi.fn().mockResolvedValue(false),
  removeFromCart: vi.fn().mockResolvedValue(false),
}));

// Replace queueMicrotask with synchronous execution for deterministic tests
globalThis.queueMicrotask = vi.fn((cb) => cb());

// Reset state between tests
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
