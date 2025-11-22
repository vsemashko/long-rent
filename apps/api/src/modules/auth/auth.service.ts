import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { prisma } from '@homemore/database';
import { RegisterDto, LoginDto, ResetPasswordDto } from './dto/auth.dto';
import { LoggerService } from '../../common/logger.service';
import { AuditLogService } from '../../common/audit-log.service';
import { randomBytes } from 'crypto';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new LoggerService();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditLogService: AuditLogService,
  ) {
    this.logger.setContext(AuthService.name);
  }

  /**
   * Register a new user
   */
  async register(dto: RegisterDto, ipAddress?: string): Promise<AuthTokens> {
    this.logger.log(`Registration attempt for email: ${dto.email}`);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role,
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    this.logger.log(`User registered successfully: ${user.id}`);

    // Log audit event
    await this.auditLogService.logAuth('register', user.id, ipAddress);

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // TODO: Send verification email
    this.logger.log(`Verification email should be sent to: ${user.email}`);

    return tokens;
  }

  /**
   * Login user
   */
  async login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthTokens> {
    this.logger.log(`Login attempt for email: ${dto.email}`);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User logged in successfully: ${user.id}`);

    // Log audit event
    await this.auditLogService.logAuth('login', user.id, ipAddress, userAgent);

    // Generate tokens
    return this.generateTokens(user.id, user.email, user.role);
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    this.logger.log(`Logout for user: ${userId}`);

    await prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });

    await this.auditLogService.logAuth('logout', userId);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Check if token is expired
      if (storedToken.expiresAt < new Date()) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
        throw new UnauthorizedException('Refresh token expired');
      }

      const user = storedToken.user;

      // Delete old refresh token (rotation)
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });

      // Generate new tokens
      return this.generateTokens(user.id, user.email, user.role);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    this.logger.log(`Password reset requested for: ${email}`);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token (reuse refresh_tokens table or create new table)
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    });

    // TODO: Send password reset email with resetToken
    this.logger.log(`Password reset email should be sent to: ${email}`);
    this.logger.debug(`Reset token (do not log in production): ${resetToken}`);
  }

  /**
   * Reset password with token
   */
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    this.logger.log('Password reset attempt');

    // Find valid reset token
    const tokens = await prisma.refreshToken.findMany({
      where: {
        expiresAt: { gte: new Date() },
      },
      include: { user: true },
    });

    let validToken = null;
    for (const token of tokens) {
      const isValid = await bcrypt.compare(dto.token, token.token);
      if (isValid) {
        validToken = token;
        break;
      }
    }

    if (!validToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: validToken.userId },
      data: { passwordHash },
    });

    // Delete reset token
    await prisma.refreshToken.delete({ where: { id: validToken.id } });

    this.logger.log(`Password reset successful for user: ${validToken.userId}`);

    // Log audit event
    await this.auditLogService.logAuth('password_reset', validToken.userId);
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    // TODO: Implement email verification logic
    this.logger.log('Email verification not yet implemented');
    throw new BadRequestException('Email verification not yet implemented');
  }

  /**
   * Generate JWT tokens (access + refresh)
   */
  private async generateTokens(userId: string, email: string, role: string): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Validate user by ID (for JWT strategy)
   */
  async validateUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.isActive) {
      return null;
    }

    // Don't return password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
