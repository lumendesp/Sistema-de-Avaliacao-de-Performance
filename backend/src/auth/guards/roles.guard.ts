import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.roles) {
      console.log('RolesGuard: No user or roles found', { user });
      return false;
    }

    // Handle roles that are stored as strings in JWT payload
    let userRoles: string[] = [];
    
    if (Array.isArray(user.roles)) {
      userRoles = user.roles.map((r: any) => {
        if (typeof r === 'string') {
          return r; // Already a string
        } else if (r && typeof r === 'object' && r.role) {
          return r.role; // Object with role property
        }
        return null;
      }).filter(Boolean);
    }

    console.log('RolesGuard Debug:', {
      requiredRoles,
      userRoles,
      user: { id: user.userId, email: user.email }
    });

    // Check if user has any of the required roles
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      console.log('RolesGuard: Access denied - user lacks required roles');
    }
    
    return hasRequiredRole;
  }
} 