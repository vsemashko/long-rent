import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    profile: {
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'TENANT' as const,
        phone: '+48123456789',
      };

      const hashedPassword = 'hashed_password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      const mockUser = {
        id: 'user-123',
        email: registerDto.email,
        password: hashedPassword,
        role: registerDto.role,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.profile.create.mockResolvedValue({
        id: 'profile-123',
        userId: mockUser.id,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
      });

      mockJwtService.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');

      const result = await service.register(registerDto);

      expect(result).toEqual({
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email.toLowerCase() },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'TENANT' as const,
        phone: '+48123456789',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockUser = {
        id: 'user-123',
        email: loginDto.email,
        password: 'hashed_password',
        role: 'TENANT',
        isVerified: true,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: loginDto.email,
        password: 'hashed_password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'Password123!';

      const mockUser = {
        id: 'user-123',
        email,
        password: 'hashed_password',
        role: 'TENANT',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
      }));
    });

    it('should return null if credentials are invalid', async () => {
      const email = 'test@example.com';
      const password = 'WrongPassword';

      const mockUser = {
        id: 'user-123',
        email,
        password: 'hashed_password',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      expect(result).toBeNull();
    });
  });

  describe('logout', () => {
    it('should delete user refresh tokens', async () => {
      const userId = 'user-123';

      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 2 });

      await service.logout(userId);

      expect(mockPrismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });
  });
});
