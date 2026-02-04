import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('EmployeesService', () => {
  let service: EmployeesService;

  const mockUserRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  it('findAll should return paginated users', async () => {
    mockUserRepository.findAndCount.mockResolvedValue([[], 0]);
    const result = await service.findAll(1, 10);
    expect(result.data).toBeDefined();
    expect(result.total).toBe(0);
  });

  it('remove should throw NotFoundException if user missing', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);
    await expect(service.remove('invalid-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findOne should throw if user missing', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    await expect(service.findOne('id')).rejects.toThrow(NotFoundException);
  });

  it('update should update and return user without password', async () => {
    const user = { id: '1', password: '123' };
    mockUserRepository.findOneBy.mockResolvedValue(user);
    mockUserRepository.save.mockResolvedValue(user);
    const result = await service.update('1', { firstName: 'New' });
    expect(result['password']).toBeUndefined();
  });

  it('findOne should throw NotFoundException', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);
    await expect(service.findOne('id')).rejects.toThrow(NotFoundException);
  });

  it('update should throw NotFoundException', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);
    await expect(service.update('id', {})).rejects.toThrow(NotFoundException);
  });

  it('findOne should return user if exists', async () => {
    const user = { id: '1', firstName: 'John' };
    mockUserRepository.findOne.mockResolvedValue(user);
    const result = await service.findOne('1');
    expect(result.firstName).toBe('John');
  });

  it('remove should remove user if exists', async () => {
    mockUserRepository.findOneBy.mockResolvedValue({ id: '1' });
    await service.remove('1');
    expect(mockUserRepository.remove).toHaveBeenCalled();
  });
});
