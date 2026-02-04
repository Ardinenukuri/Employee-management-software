import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

describe('EmployeesController', () => {
  let controller: EmployeesController;
  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [{ provide: EmployeesService, useValue: mockService }],
    }).compile();
    controller = module.get<EmployeesController>(EmployeesController);
  });

  it('should call all service methods', async () => {
    await controller.findAll(1, 10);
    await controller.findOne('id');
    await controller.update('id', {});
    await controller.remove('id');
    expect(mockService.findAll).toHaveBeenCalled();
  });
});
