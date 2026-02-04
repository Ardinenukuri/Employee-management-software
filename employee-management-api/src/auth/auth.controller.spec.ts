import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('should call all endpoints', async () => {
    await controller.register({} as any);
    await controller.login({} as any);
    await controller.forgotPassword({ email: 't@t.com' });
    await controller.resetPassword({} as any);
    await controller.logout();
    
    expect(mockAuthService.register).toHaveBeenCalled();
    expect(mockAuthService.login).toHaveBeenCalled();
    expect(mockAuthService.forgotPassword).toHaveBeenCalled();
    expect(mockAuthService.resetPassword).toHaveBeenCalled();
  });
});