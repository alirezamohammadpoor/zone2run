/**
 * Webhook Logger Module
 *
 * Structured logging utility for webhook operations.
 * Replaces 132+ console.log statements with consistent, parseable output.
 *
 * Benefits:
 * - Consistent log format across all webhook operations
 * - Easy to filter/search in Vercel logs
 * - Ready for integration with external logging services (Sentry, LogRocket)
 * - Reduced log verbosity in production
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  webhookId?: string | null;
  eventId?: string | null;
  productId?: string;
  collectionId?: string;
  topic?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
  };
}

// Environment-based log level threshold
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LOG_LEVEL: LogLevel =
  process.env.NODE_ENV === "production" ? "info" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

function formatLogEntry(entry: LogEntry): string {
  // In production, use JSON for easy parsing
  if (process.env.NODE_ENV === "production") {
    return JSON.stringify(entry);
  }

  // In development, use readable format
  const emoji = {
    debug: "🔍",
    info: "ℹ️",
    warn: "⚠️",
    error: "❌",
  }[entry.level];

  let output = `${emoji} [${entry.level.toUpperCase()}] ${entry.message}`;

  if (entry.context && Object.keys(entry.context).length > 0) {
    output += ` | ${JSON.stringify(entry.context)}`;
  }

  if (entry.error) {
    output += ` | Error: ${entry.error.message}`;
  }

  return output;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (context) {
    entry.context = context;
  }

  if (error) {
    entry.error = {
      message: error.message,
      stack: error.stack,
    };
  }

  return entry;
}

/**
 * Webhook Logger
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/webhook/logger';
 *
 * logger.info('Processing product', { productId: '123', title: 'Cool Shirt' });
 * logger.error('Failed to sync', { productId: '123' }, new Error('Network timeout'));
 * ```
 */
export const logger = {
  debug(message: string, context?: LogContext): void {
    if (!shouldLog("debug")) return;
    const entry = createLogEntry("debug", message, context);
    console.log(formatLogEntry(entry));
  },

  info(message: string, context?: LogContext): void {
    if (!shouldLog("info")) return;
    const entry = createLogEntry("info", message, context);
    console.log(formatLogEntry(entry));
  },

  warn(message: string, context?: LogContext): void {
    if (!shouldLog("warn")) return;
    const entry = createLogEntry("warn", message, context);
    console.warn(formatLogEntry(entry));
  },

  error(message: string, context?: LogContext, error?: Error): void {
    if (!shouldLog("error")) return;
    const entry = createLogEntry("error", message, context, error);
    console.error(formatLogEntry(entry));
  },

  /**
   * Log a section header for visual separation in logs
   */
  section(title: string): void {
    if (!shouldLog("info")) return;
    if (process.env.NODE_ENV === "production") {
      this.info(`=== ${title} ===`);
    } else {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`  ${title}`);
      console.log(`${"=".repeat(60)}`);
    }
  },

  /**
   * Log webhook receipt with all header information
   */
  webhookReceived(headers: {
    topic: string | null;
    webhookId: string | null;
    eventId: string | null;
    isRealShopify: boolean;
  }): void {
    this.section("WEBHOOK RECEIVED");
    this.info("Webhook details", {
      topic: headers.topic ?? undefined,
      webhookId: headers.webhookId,
      eventId: headers.eventId,
      isRealShopify: headers.isRealShopify,
    });
  },

  /**
   * Log product processing start
   */
  productStart(productId: string, title: string, action: string): void {
    this.section(`PRODUCT ${action.toUpperCase()}`);
    this.info("Processing product", { productId, title });
  },

  /**
   * Log collection processing start
   */
  collectionStart(collectionId: string, title: string, action: string): void {
    this.section(`COLLECTION ${action.toUpperCase()}`);
    this.info("Processing collection", { collectionId, title });
  },

  /**
   * Log successful completion
   */
  success(message: string, context?: LogContext): void {
    this.info(`✅ ${message}`, context);
  },

  /**
   * Log skipped operation (duplicate, rate limit, etc.)
   */
  skipped(reason: string, context?: LogContext): void {
    this.warn(`Skipped: ${reason}`, context);
  },
};

export type Logger = typeof logger;
