import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MailProducerService } from '../mail/mail.producer.service';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;

  // 1. IMPROVED MOCK: Added findOneBy
  const mockUserRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockAccessToken'),
    verify: jest.fn(),
  };

  const mockMailProducer = {
    sendPasswordResetLink: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailProducerService, useValue: mockMailProducer },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  // Clear all mocks after each test to ensure a clean state
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        employeeIdentifier: 'E123',
        phoneNumber: '1234567890',
      };
      
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(createUserDto);
      mockUserRepository.save.mockResolvedValue(createUserDto);

      const result = await service.register(createUserDto as any);
      expect(result).not.toHaveProperty('password');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 'uuid',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'employee',
    };

    it('should return an access token on successful login', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'test@example.com', password: 'password123' });
      expect(result).toEqual({ accessToken: 'mockAccessToken' });
    });

    it('forgotPassword should still work if user is not found (generic message)', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      const result = await service.forgotPassword('unknown@test.com');
      expect(result.message).toContain('If a matching account exists');
    });

    it('resetPassword should throw UnauthorizedException on verification error', async () => {
      // Force verify to throw an error
      jest.spyOn(mockJwtService, 'verify').mockImplementation(() => {
        throw new Error('JWT Expired');
      });

      await expect(service.resetPassword({ token: 'expired-token', newPassword: '123' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@example.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('resetPassword', () => {
    it('should throw error on invalid token', async () => {
      jest.spyOn(service['jwtService'], 'verify').mockImplementation(() => { throw new Error(); });
      await expect(service.resetPassword({ token: 'bad', newPassword: '123' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw error if user not found during reset', async () => {
      jest.spyOn(service['jwtService'], 'verify').mockReturnValue({ purpose: 'password-reset', email: 'test@test.com' });
      mockUserRepository.findOneBy.mockResolvedValue(null);
      await expect(service.resetPassword({ token: 'valid', newPassword: '123' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('forgotPassword', () => {
    it('should generate a token and queue an email if user exists', async () => {
      mockUserRepository.findOneBy.mockResolvedValue({ email: 'test@example.com', id: '1' });
      
      await service.forgotPassword('test@example.com');
      
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(mockMailProducer.sendPasswordResetLink).toHaveBeenCalled();
    });
  });

  it('register should throw ConflictException if user exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: '1' });
      await expect(service.register({ email: 'test@test.com' } as any)).rejects.toThrow(ConflictException);
    });

    it('login should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      await expect(service.login({ email: 'none@test.com', password: '123' })).rejects.toThrow(UnauthorizedException);
    });
    
    it('resetPassword should throw error if purpose is wrong', async () => {
      jest.spyOn(service['jwtService'], 'verify').mockReturnValue({ purpose: 'wrong' });
      await expect(service.resetPassword({ token: 'tok', newPassword: '123' })).rejects.toThrow(UnauthorizedException);
    });

    it('should reset password if user found', async () => {
      jest.spyOn(service['jwtService'], 'verify').mockReturnValue({ purpose: 'password-reset', email: 'test@test.com' });
      const user = { email: 'test@test.com', password: 'old', id: '1' };
      mockUserRepository.findOneBy.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(user);
      const result = await service.resetPassword({ token: 'valid', newPassword: 'newpass' });
      expect(result.message).toBe('Password has been reset successfully.');
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({ password: 'hashedPassword' }));
    });
});