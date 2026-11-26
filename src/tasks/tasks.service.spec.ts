import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectsService } from '../projects/projects.service.js';
import { Task } from './entities/task.entity.js';
import { TaskPriority } from './enums/task-priority.enum.js';
import { TaskStatus } from './enums/task-status.enum.js';
import { TasksService } from './tasks.service.js';

describe('TasksService', () => {
  let service: TasksService;

  const mockTaskRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    remove: vi.fn(),
  };

  const mockProjectsService = {
    findOne: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should create a task when dueDate is within project range', async () => {
    mockProjectsService.findOne.mockResolvedValue({
      id: 1,
      startDate: '2026-11-01',
      endDate: '2026-12-31',
    });

    const dto = {
      title: 'Implement unit tests',
      priority: TaskPriority.HIGH,
      dueDate: '2026-12-10',
      projectId: 1,
    };

    const createdTask = { id: 1, status: TaskStatus.PENDING, ...dto };
    mockTaskRepository.create.mockReturnValue(createdTask);
    mockTaskRepository.save.mockResolvedValue(createdTask);

    const result = await service.create(dto);
    expect(result).toEqual(createdTask);
  });

  it('should throw BadRequestException if task dueDate is outside project range', async () => {
    mockProjectsService.findOne.mockResolvedValue({
      id: 1,
      startDate: '2026-11-01',
      endDate: '2026-12-31',
    });

    const dto = {
      title: 'Late task',
      dueDate: '2027-01-15',
      projectId: 1,
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should update task status successfully', async () => {
    const existingTask = { id: 1, title: 'Test', status: TaskStatus.PENDING };
    mockTaskRepository.findOne.mockResolvedValue(existingTask);
    mockTaskRepository.save.mockResolvedValue({
      ...existingTask,
      status: TaskStatus.COMPLETED,
    });

    const result = await service.updateStatus(1, {
      status: TaskStatus.COMPLETED,
    });

    expect(result.status).toBe(TaskStatus.COMPLETED);
  });
});
