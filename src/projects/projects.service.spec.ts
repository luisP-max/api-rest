import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskStatus } from '../tasks/enums/task-status.enum.js';
import { Project } from './entities/project.entity.js';
import { ProjectsService } from './projects.service.js';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const mockProjectRepository = {
    create: vi.fn(),
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should create a project successfully', async () => {
    const dto = {
      name: 'API REST NestJS',
      description: 'Project management backend',
      startDate: '2026-11-01',
      endDate: '2026-12-31',
    };
    const savedProject = { id: 1, ...dto, tasks: [] };

    mockProjectRepository.create.mockReturnValue(savedProject);
    mockProjectRepository.save.mockResolvedValue(savedProject);

    const result = await service.create(dto);
    expect(result).toEqual(savedProject);
    expect(mockProjectRepository.save).toHaveBeenCalledWith(savedProject);
  });

  it('should throw BadRequestException if endDate is earlier than startDate', async () => {
    const dto = {
      name: 'Invalid Dates Project',
      startDate: '2026-12-31',
      endDate: '2026-11-01',
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException when project does not exist', async () => {
    mockProjectRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should calculate project progress percentage accurately', async () => {
    const mockProject = {
      id: 1,
      name: 'Test Project',
      tasks: [
        { id: 1, status: TaskStatus.COMPLETED },
        { id: 2, status: TaskStatus.COMPLETED },
        { id: 3, status: TaskStatus.PENDING },
        { id: 4, status: TaskStatus.IN_PROGRESS },
      ],
    };

    mockProjectRepository.findOne.mockResolvedValue(mockProject);

    const progress = await service.getProjectProgress(1);
    expect(progress).toEqual({
      projectId: 1,
      projectName: 'Test Project',
      totalTasks: 4,
      completedTasks: 2,
      progressPercentage: 50,
    });
  });

  it('should prevent deleting a project with pending tasks', async () => {
    const mockProject = {
      id: 1,
      name: 'Active Project',
      tasks: [{ id: 10, status: TaskStatus.PENDING }],
    };

    mockProjectRepository.findOne.mockResolvedValue(mockProject);

    await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    expect(mockProjectRepository.remove).not.toHaveBeenCalled();
  });
});
