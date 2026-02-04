import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let repo: any;
  let config: any;

  beforeEach(() => {
    config = { get: jest.fn().mockReturnValue('secret') };
    repo = { findOneBy: jest.fn() };
    strategy = new JwtStrategy(repo, config as any);
  });

  it('should call ConfigService.get with JWT_SECRET on construction', () => {
    expect(config.get).toHaveBeenCalledWith('JWT_SECRET');
  });

  it('should validate and return user', async () => {
    const user = { email: 'test@test.com' };
    repo.findOneBy.mockResolvedValue(user);
    expect(await strategy.validate({ email: 'test@test.com' })).toBe(user);
    expect(repo.findOneBy).toHaveBeenCalledWith({ email: 'test@test.com' });
  });

  it('should throw UnauthorizedException if user not found', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(strategy.validate({ email: 'none' })).rejects.toThrow(UnauthorizedException);
    expect(repo.findOneBy).toHaveBeenCalledWith({ email: 'none' });
  });

  it('should call findOneBy with undefined if payload has no email and throw UnauthorizedException', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(strategy.validate({} as any)).rejects.toThrow(UnauthorizedException);
    expect(repo.findOneBy).toHaveBeenCalledWith({ email: undefined });
  });

  it('should throw error if JWT_SECRET is missing (undefined)', () => {
    const cfg = { get: jest.fn().mockReturnValue(undefined) };
    expect(() => new JwtStrategy({ findOneBy: jest.fn() } as any, cfg as any)).toThrow(
      'JWT secret not found in environment variables.',
    );
  });

  it('should throw error if JWT_SECRET is empty string', () => {
    const cfg = { get: jest.fn().mockReturnValue('') };
    expect(() => new JwtStrategy({ findOneBy: jest.fn() } as any, cfg as any)).toThrow(
      'JWT secret not found in environment variables.',
    );
  });
});