import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Observable, tap, catchError } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    // Skip logging for health checks and noise
    if (this.shouldSkipLogging(request)) {
      return next.handle();
    }

    const now = new Date();
    const user = request.user as any; // assume que vem do JWT (via Passport)
    const ip = this.getClientIp(request);
    const path = request.url;
    const method = request.method;
    const userAgent = request.headers['user-agent'] || 'unknown';
    
    // Try to extract user information from JWT token if not available from request.user
    const userInfo = this.extractUserInfo(request, user);
    
    // Capture request body for non-GET requests (excluding sensitive data)
    const requestBody = this.sanitizeRequestBody(request);

    return next.handle().pipe(
      tap(async (data) => {
        try {
          await this.prisma.log.create({
            data: {
              userId: userInfo.userId || null,
              userEmail: userInfo.userEmail || null,
              userName: userInfo.userName || null,
              action: `${method} ${path}`,
              method,
              path,
              ip,
              userAgent,
              requestBody: requestBody ? JSON.stringify(requestBody) : null,
              responseStatus: response.statusCode,
              responseTime: Date.now() - now.getTime(),
              createdAt: now,
            },
          });
        } catch (error) {
          // Don't let logging errors break the application
          console.error('[LogInterceptor] Error creating log entry:', error);
        }
      }),
      catchError(async (error) => {
        try {
          await this.prisma.log.create({
            data: {
              userId: userInfo.userId || null,
              userEmail: userInfo.userEmail || null,
              userName: userInfo.userName || null,
              action: `${method} ${path} (ERROR)`,
              method,
              path,
              ip,
              userAgent,
              requestBody: requestBody ? JSON.stringify(requestBody) : null,
              responseStatus: error.status || 500,
              responseTime: Date.now() - now.getTime(),
              errorMessage: error.message || 'Unknown error',
              createdAt: now,
            },
          });
        } catch (logError) {
          console.error('[LogInterceptor] Error creating error log entry:', logError);
        }
        console.error('[LogInterceptor] Request error:', error);
        throw error;
      }),
    );
  }

  private shouldSkipLogging(request: Request): boolean {
    const skipPaths = [
      '/health',
      '/favicon.ico',
      '/robots.txt',
      '/.well-known',
    ];
    
    return skipPaths.some(path => request.url.startsWith(path));
  }

  private getClientIp(request: Request): string {
    return (
      request.headers['x-forwarded-for']?.toString().split(',')[0] ||
      request.headers['x-real-ip']?.toString() ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }

  private extractUserInfo(request: Request, user: any): { userId: number | null; userEmail: string | null; userName: string | null } {
    // If user info is available from JWT guard, use it
    if (user?.userId || user?.id) {
      return {
        userId: user.userId || user.id,
        userEmail: user.email || null,
        userName: user.name || null,
      };
    }

    // Try to extract user info from Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        // Decode JWT token without verification (for logging purposes only)
        const payload = this.decodeJwtToken(token);
        if (payload) {
          return {
            userId: payload.sub || payload.userId || null,
            userEmail: payload.email || null,
            userName: payload.name || null,
          };
        }
      } catch (error) {
        // Silently fail - we don't want logging to break the application
      }
    }

    return {
      userId: null,
      userEmail: null,
      userName: null,
    };
  }

  private decodeJwtToken(token: string): any {
    try {
      // Simple JWT decode without verification (for logging only)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  private sanitizeRequestBody(request: Request): any {
    if (request.method === 'GET') {
      return null;
    }

    const body = request.body;
    if (!body) {
      return null;
    }

    // Create a copy and remove sensitive fields
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'authorization', 'secret'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
  