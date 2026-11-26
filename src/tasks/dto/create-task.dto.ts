import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, IsInt, IsPositive } from 'class-validator';
import { TaskPriority } from '../enums/task-priority.enum.js';
import { TaskStatus } from '../enums/task-status.enum.js';

export class CreateTaskDto {
    @ApiProperty({ example: 'configure TypeORM Entities', description: 'Task title' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    title: string;

    @ApiPropertyOptional({ example: 'Create Project and Task entities with 1:N relation' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.PENDING })
    @IsEnum(TaskStatus)
    @IsOptional()
    status?: TaskStatus;

    @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
    @IsEnum(TaskPriority)
    @IsOptional()
    priority?: TaskPriority;

    @ApiProperty({ example: '2026-12-15', description: 'Task due date (YYYY-MM-DD' })
    @IsDateString()
    @IsNotEmpty()
    dueDate: string;

    @ApiProperty({ example: 1, description: 'ID of the project this task belong to' })
    @IsInt()
    @IsPositive()
    projectId: number;
}