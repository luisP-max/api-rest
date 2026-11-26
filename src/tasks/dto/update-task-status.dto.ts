import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum.js';

export class UpdateTaskStatusDto {
    @ApiProperty({ enum: TaskStatus, example: TaskStatus.COMPLETED})
    @IsEnum(TaskStatus)
    status: TaskStatus;
}