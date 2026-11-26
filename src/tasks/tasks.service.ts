import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import { ProjectsService } from '../projects/projects.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { FilterTasksDto } from './dto/filter-tasks.dto.js';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { Task } from './entities/task.entity.js';
import { TaskStatus } from './enums/task-status.enum.js';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
        private readonly projectsService: ProjectsService,
    ) {}

    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        const project = await this.projectsService.findOne(createTaskDto.projectId);
        
        const dueDate = new Date(createTaskDto.dueDate);
        const projectStart = new Date(project.startDate);
        const projectEnd = new Date(project.endDate);

        if (dueDate < projectStart || dueDate > projectEnd) {
            throw new BadRequestException( 'Task due date must be within the project start and end dates', );
        }
        
        const task = this.taskRepository.create(createTaskDto);
        return await this.taskRepository.save(task);
    }

    async findAll(filterDto: FilterTasksDto): Promise<Task[]> {
        const { status, priority } = filterDto;

        return await this.taskRepository.find({
            where: {
                ...(status && { status }),
                ...(priority && { priority }),
            },
            relations: { project: true },
            order: { dueDate: 'ASC' },
        });
    }

    async findByProject(projectId: number): Promise<Task[]> {
        await this.projectsService.findOne(projectId);

        return await this.taskRepository.find({
            where: { projectId },
            order: { dueDate: 'ASC' },
        });
    }

    async findOverdueTasks(): Promise<Task[]> {
        const today = new Date().toISOString().split('T')[0];

        return await this.taskRepository.find({
            where:{
                dueDate: LessThan(today as unknown as Date),
                status: Not(TaskStatus.COMPLETED),
            },
            relations: { project: true },
            order: { dueDate: 'ASC' },
        });
    }

    async findOne(id: number): Promise<Task> {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: { project: true },
        });

        if (!task) {
            throw new NotFoundException(`Task with IS ${id} not found`);
        }

        return task;
    }

    async update(id:number, updateTaskDto: UpdateTaskDto): Promise<Task> {
        const task = await this.findOne(id);

        const targetProjectId = updateTaskDto.projectId ?? task.projectId;
        const project = await this.projectsService.findOne(targetProjectId);

        const targetDueDate = new Date(updateTaskDto.dueDate ?? task.dueDate);
        if (
            targetDueDate < new Date(project.startDate) ||
            targetDueDate > new Date(project.endDate)
        ) {
            throw new BadRequestException( 'Task due date must be within the project start and end dates', );
        }

        Object.assign(task, updateTaskDto);
        return await this.taskRepository.save(task)
    }

    async updateStatus(
        id: number,
        UpdateTaskStatusDto: UpdateTaskStatusDto
    ): Promise<Task> {
        const task = await this.findOne(id);
        task.status = UpdateTaskStatusDto.status;
        return await this.taskRepository.save(task);
    }

    async remove(id:number): Promise<{ message: string }> {
        const task = await this.findOne(id);
        await this.taskRepository.remove(task);
        return {message: 'Task with ID ${id} successfully deleted' };
    }
}