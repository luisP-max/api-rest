import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { TaskStatus } from '../tasks/enums/task-status.enum.js'
import { CreateProjectDto } from './dto/create-project.dto.js'
import { UpdateProjectDto } from './dto/update-project.dto.js'
import { Project } from './entities/project.entity.js'

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
    ) {};

    async create(createProjectDto: CreateProjectDto): Promise<Project> {
        if (new Date(createProjectDto.endDate) < new Date(createProjectDto.startDate)) {
            throw new BadRequestException('End date cannot be earlier than start date ');
        }

        const project = this.projectRepository.create(createProjectDto);
        return await this.projectRepository.save(project);
    }

    async findAll(): Promise<Project[]> {
        return await this.projectRepository.find({
            relations: { tasks: true},
        });
    }

    async findOne(id: number): Promise<Project> {
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: { tasks: true },
        });

        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        return project;
    }

    async update(id: number, updateProjectDto: UpdateProjectDto): Promise<Project> {
        const project = await this.findOne(id);

        const newStartDate = updateProjectDto.startDate ?? project.startDate;
        const newEndDate = updateProjectDto.endDate ?? project.endDate;

        if (new Date(newEndDate) < new Date(newStartDate)) {
            throw new BadRequestException('End date cannot be earlier than start date');
        }

        Object.assign(project, updateProjectDto);
        return await this.projectRepository.save(project);
    }

    async remove(id: number): Promise<{ message: string }> {
        const project = await this.findOne(id)

        const hasPendingTasks = project.tasks?.some(
            (task) => task.status === TaskStatus.PENDING,
        );

        if (hasPendingTasks) {
            throw new BadRequestException(
                'Cannot delete a project that still has pendig tasks',
            );
        }

        await this.projectRepository.remove(project);
        return { message: `Project with ID ${id} successfully deleted` };
    }

    async getProjectProgress(id:number) {
        const project = await this.findOne(id);
        const totalTasks = project.tasks?.length ?? 0; 

        const completedTasks = project.tasks?.filter((task) => task.status === TaskStatus.COMPLETED).length ?? 0;
        
        const progressPercentage = totalTasks === 0 ? 0: Number(((completedTasks / totalTasks)*100).toFixed(2));

        return {
            projectId: project.id,
            projectName: project.name,
            totalTasks,
            completedTasks,
            progressPercentage,
        };
    }
}