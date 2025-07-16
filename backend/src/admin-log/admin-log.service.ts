import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';

export interface LogFilters {
  userId?: number;
  userEmail?: string;
  method?: string;
  path?: string;
  ip?: string;
  responseStatus?: number;
  startDate?: Date;
  endDate?: Date;
  errorOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface LogStats {
  totalLogs: number;
  uniqueUsers: number;
  uniqueIPs: number;
  errorCount: number;
  averageResponseTime: number;
  topPaths: Array<{ path: string; count: number }>;
  topUsers: Array<{ userEmail: string; count: number }>;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTracks: number;
  activeTracks: number;
  totalEvaluations: number;
  completedEvaluations: number;
  trackDistribution: Array<{ trackName: string; userCount: number }>;
}

@Injectable()
export class AdminLogService {
  constructor(private readonly prisma: PrismaService) {}

  async getLogs(filters: LogFilters = {}, userRoles: Role[]) {
    // Only ADMIN users can access logs
    if (!userRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Only administrators can access system logs');
    }

    const {
      userId,
      userEmail,
      method,
      path,
      ip,
      responseStatus,
      startDate,
      endDate,
      errorOnly,
      page = 1,
      limit = 50,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (userId) where.userId = userId;
    if (userEmail) where.userEmail = { contains: userEmail, mode: 'insensitive' };
    if (method) where.method = method;
    if (path) where.path = { contains: path, mode: 'insensitive' };
    if (ip) where.ip = { contains: ip, mode: 'insensitive' };
    if (responseStatus) where.responseStatus = responseStatus;
    if (errorOnly) where.errorMessage = { not: null };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.log.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.log.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRecentLogs(limit: number = 5, userRoles: Role[]) {
    // Only ADMIN users can access logs
    if (!userRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Only administrators can access system logs');
    }

    return this.prisma.log.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getDashboardStats(userRoles: Role[]): Promise<DashboardStats> {
    // Only ADMIN users can access dashboard statistics
    if (!userRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Only administrators can access dashboard statistics');
    }

    const [
      totalUsers,
      activeUsers,
      totalTracks,
      activeTracks,
      totalEvaluations,
      completedEvaluations,
      trackDistribution,
    ] = await Promise.all([
      // Total users
      this.prisma.user.count(),
      
      // Active users
      this.prisma.user.count({
        where: { active: true },
      }),
      
      // Total tracks
      this.prisma.track.count(),
      
      // Active tracks (tracks with users)
      this.prisma.track.count({
        where: {
          users: {
            some: {}
          }
        }
      }),
      
      // Total evaluations (all types)
      Promise.all([
        this.prisma.selfEvaluation.count(),
        this.prisma.peerEvaluation.count(),
        this.prisma.mentorEvaluation.count(),
        this.prisma.managerEvaluation.count(),
        this.prisma.reference.count(),
      ]).then(counts => counts.reduce((sum, count) => sum + count, 0)),
      
      // Completed evaluations (submitted)
      Promise.all([
        this.prisma.selfEvaluation.count({
          where: { averageScore: { not: null } },
        }),
        this.prisma.peerEvaluation.count(),
        this.prisma.mentorEvaluation.count(),
        this.prisma.managerEvaluation.count({
          where: { status: 'submitted' },
        }),
        this.prisma.reference.count(),
      ]).then(counts => counts.reduce((sum, count) => sum + count, 0)),

      // Track distribution
      this.prisma.track.findMany({
        include: {
          _count: {
            select: { users: true }
          }
        },
        orderBy: {
          users: {
            _count: 'desc'
          }
        }
      }).then(tracks => tracks.map(track => ({
        trackName: track.name,
        userCount: track._count.users,
      }))),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalTracks,
      activeTracks,
      totalEvaluations,
      completedEvaluations,
      trackDistribution,
    };
  }

  async getLogStats(userRoles: Role[]): Promise<LogStats> {
    // Only ADMIN users can access log statistics
    if (!userRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Only administrators can access log statistics');
    }

    const [
      totalLogs,
      uniqueUsers,
      uniqueIPs,
      errorCount,
      averageResponseTime,
      topPaths,
      topUsers,
    ] = await Promise.all([
      this.prisma.log.count(),
      this.prisma.log.groupBy({
        by: ['userId'],
        where: { userId: { not: null } },
        _count: { userId: true },
      }).then(result => result.length),
      this.prisma.log.groupBy({
        by: ['ip'],
        _count: { ip: true },
      }).then(result => result.length),
      this.prisma.log.count({ where: { errorMessage: { not: null } } }),
      this.prisma.log.aggregate({
        _avg: { responseTime: true },
        where: { responseTime: { not: null } },
      }).then(result => result._avg.responseTime || 0),
      this.prisma.log.groupBy({
        by: ['path'],
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 10,
      }),
      this.prisma.log.groupBy({
        by: ['userEmail'],
        _count: { userEmail: true },
        where: { userEmail: { not: null } },
        orderBy: { _count: { userEmail: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalLogs,
      uniqueUsers,
      uniqueIPs,
      errorCount,
      averageResponseTime: Math.round(averageResponseTime),
      topPaths: topPaths.map(item => ({
        path: item.path,
        count: item._count.path,
      })),
      topUsers: topUsers.map(item => ({
        userEmail: item.userEmail || 'Unknown',
        count: item._count.userEmail,
      })),
    };
  }

  async getLogById(id: number, userRoles: Role[]) {
    // Only ADMIN users can access individual logs
    if (!userRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Only administrators can access system logs');
    }

    return this.prisma.log.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteOldLogs(daysToKeep: number, userRoles: Role[]) {
    // Only ADMIN users can delete logs
    if (!userRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Only administrators can delete system logs');
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.log.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return {
      deletedCount: result.count,
      cutoffDate,
    };
  }

  async exportLogs(filters: LogFilters = {}, userRoles: Role[]) {
    // Only ADMIN users can export logs
    if (!userRoles.includes(Role.ADMIN)) {
      throw new ForbiddenException('Only administrators can export system logs');
    }

    const logs = await this.getLogs({ ...filters, limit: 10000 }, userRoles);
    
    return logs.logs.map(log => ({
      id: log.id,
      userId: log.userId,
      userEmail: log.userEmail,
      userName: log.userName || log.user?.name, // Use stored userName first, fallback to user relation
      action: log.action,
      method: log.method,
      path: log.path,
      ip: log.ip,
      userAgent: log.userAgent,
      requestBody: log.requestBody,
      responseStatus: log.responseStatus,
      responseTime: log.responseTime,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt,
    }));
  }
} 