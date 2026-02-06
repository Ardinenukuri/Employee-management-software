import { ExecutionContext } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';

describe('CurrentUser Decorator', () => {
  it('should return user from request', () => {
    class TestController {
      test(@CurrentUser() user: any) {}
    }

    const mockUser = { id: '1', email: 'test@test.com' };
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: mockUser }),
      }),
    } as unknown as ExecutionContext;

    const metadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      TestController,
      'test',
    );
    const factory = metadata[Object.keys(metadata)[0]].factory;

    const result = factory(null, mockContext);
    expect(result).toEqual(mockUser);
  });
});
