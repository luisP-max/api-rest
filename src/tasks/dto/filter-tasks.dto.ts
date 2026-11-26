import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { TaskPriority } from '../enums/task-priority.enum.js';
import { TaskStatus } from '../enums/task-status.enum.js';

export class FilterTasksDto {
    @ApiPropertyOptional({ enum: TaskStatus, description: 'Filter tasks by status' })
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @ApiPropertyOptional({ enum: TaskPriority, description: 'Filter tasks by priority' })
    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;
}