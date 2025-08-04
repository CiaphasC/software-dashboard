// =============================================================================
// LOGGER - Sistema de logging configurable
// Arquitectura de Software Profesional - Logging Inteligente
// =============================================================================

// =============================================================================
// LOG LEVELS - Niveles de log
// =============================================================================

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

// =============================================================================
// LOGGER CONFIG - Configuración del logger
// =============================================================================

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableProductionLogs: boolean;
  enableTimestamps: boolean;
  enableCallerInfo: boolean;
}

// =============================================================================
// DEFAULT CONFIG - Configuración por defecto
// =============================================================================

const defaultConfig: LoggerConfig = {
  level: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.ERROR,
  enableConsole: import.meta.env.DEV,
  enableProductionLogs: false,
  enableTimestamps: true,
  enableCallerInfo: import.meta.env.DEV
};

// =============================================================================
// LOGGER CLASS - Clase principal del logger
// =============================================================================

class Logger {
  private config: LoggerConfig = defaultConfig;

  // =============================================================================
  // CONFIGURATION - Configuración del logger
  // =============================================================================

  setConfig(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // =============================================================================
  // UTILITY METHODS - Métodos de utilidad
  // =============================================================================

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enableConsole) return false;
    if (!import.meta.env.DEV && !this.config.enableProductionLogs) return false;
    return level <= this.config.level;
  }

  private formatMessage(level: string, message: string, ...args: unknown[]): string {
    const parts: string[] = [];

    if (this.config.enableTimestamps) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    parts.push(`[${level}]`);

    if (this.config.enableCallerInfo) {
      const stack = new Error().stack;
      const caller = stack?.split('\n')[3]?.trim().replace(/^at\s+/, '') || 'unknown';
      parts.push(`[${caller}]`);
    }

    parts.push(message);

    return parts.join(' ');
  }

  private log(level: LogLevel, levelName: string, message: string, ...args: unknown[]) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(levelName, message);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, ...args);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, ...args);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, ...args);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage, ...args);
        break;
      case LogLevel.TRACE:
        console.trace(formattedMessage, ...args);
        break;
    }
  }

  // =============================================================================
  // LOGGING METHODS - Métodos de logging
  // =============================================================================

  error(message: string, ...args: unknown[]) {
    this.log(LogLevel.ERROR, 'ERROR', message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    this.log(LogLevel.WARN, 'WARN', message, ...args);
  }

  info(message: string, ...args: unknown[]) {
    this.log(LogLevel.INFO, 'INFO', message, ...args);
  }

  debug(message: string, ...args: unknown[]) {
    this.log(LogLevel.DEBUG, 'DEBUG', message, ...args);
  }

  trace(message: string, ...args: unknown[]) {
    this.log(LogLevel.TRACE, 'TRACE', message, ...args);
  }

  // =============================================================================
  // SPECIALIZED METHODS - Métodos especializados
  // =============================================================================

  logError(error: unknown, context?: string) {
    const message = error instanceof Error ? error.message : String(error);
    const contextMsg = context ? `[${context}] ` : '';
    this.error(`${contextMsg}${message}`);
    
    if (error instanceof Error && error.stack) {
      this.debug('Stack trace:', error.stack);
    }
  }

  logApiCall(endpoint: string, method: string, status?: number, duration?: number) {
    const parts = [`${method} ${endpoint}`];
    if (status) parts.push(`Status: ${status}`);
    if (duration) parts.push(`Duration: ${duration}ms`);
    
    this.info(`API Call: ${parts.join(' | ')}`);
  }

  logUserAction(action: string, userId?: string, details?: Record<string, unknown>) {
    const parts = [action];
    if (userId) parts.push(`User: ${userId}`);
    if (details) parts.push(`Details: ${JSON.stringify(details)}`);
    
    this.info(`User Action: ${parts.join(' | ')}`);
  }

  logPerformance(operation: string, duration: number, metadata?: Record<string, unknown>) {
    const parts = [`${operation}: ${duration}ms`];
    if (metadata) parts.push(`Metadata: ${JSON.stringify(metadata)}`);
    
    this.debug(`Performance: ${parts.join(' | ')}`);
  }
}

// =============================================================================
// LOGGER INSTANCE - Instancia global del logger
// =============================================================================

export const logger = new Logger();

// =============================================================================
// LEGACY EXPORTS - Exportaciones legacy para compatibilidad
// =============================================================================

export const log = (...args: unknown[]) => {
  logger.debug(args.map(arg => String(arg)).join(' '));
};

export const warn = (...args: unknown[]) => {
  logger.warn(args.map(arg => String(arg)).join(' '));
};

export const error = (...args: unknown[]) => {
  logger.error(args.map(arg => String(arg)).join(' '));
};

// =============================================================================
// TYPE EXPORTS - Exportaciones de tipos
// =============================================================================

export type { LoggerConfig };
