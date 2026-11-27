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

  it('should return all projects with their tasks', async () => {
    const projects = [{ id: 1, name: 'Project A', tasks: [] }];
    mockProjectRepository.find.mockResolvedValue(projects);

    const result = await service.findAll();
    expect(result).toEqual(projects);
    expect(mockProjectRepository.find).toHaveBeenCalledWith({
      relations: { tasks: true },
    });
  });

  it('should throw NotFoundException when project does not exist', async () => {
    mockProjectRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should update a project successfully', async () => {
    const existingProject = {
      id: 1,
      name: 'Old Name',
      startDate: '2026-11-01',
      endDate: '2026-12-31',
      tasks: [],
    };
    const updatedProject = { ...existingProject, name: 'New Name' };

    mockProjectRepository.findOne.mockResolvedValue(existingProject);
    mockProjectRepository.save.mockResolvedValue(updatedProject);

    const result = await service.update(1, { name: 'New Name' });
    expect(result.name).toBe('New Name');
  });

  it('should throw BadRequestException when updating with invalid date range', async () => {
    const existingProject = {
      id: 1,
      name: 'Project A',
      startDate: '2026-11-01',
      endDate: '2026-12-31',
      tasks: [],
    };

    mockProjectRepository.findOne.mockResolvedValue(existingProject);

    await expect(
      service.update(1, { endDate: '2026-10-01' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should calculate 0% progress when project has no tasks', async () => {
    mockProjectRepository.findOne.mockResolvedValue({
      id: 1,
      name: 'Empty Project',
      tasks: [],
    });

    const progress = await service.getProjectProgress(1);
    expect(progress.progressPercentage).toBe(0);
    expect(progress.totalTasks).toBe(0);
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

  it('should delete a project when all tasks are completed', async () => {
    const mockProject = {
      id: 1,
      name: 'Finished Project',
      tasks: [{ id: 10, status: TaskStatus.COMPLETED }],
    };

    mockProjectRepository.findOne.mockResolvedValue(mockProject);
    mockProjectRepository.remove.mockResolvedValue(mockProject);

    const result = await service.remove(1);
    expect(result.message).toContain('successfully deleted');
    expect(mockProjectRepository.remove).toHaveBeenCalledWith(mockProject);
  });
});
