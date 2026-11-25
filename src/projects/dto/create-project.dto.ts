import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateProjectDto {
    @ApiProperty({ example: 'E-commerce Platform', description: 'Project name' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name: string;

    @ApiPropertyOptional({ example: 'Backend API development with NestJS', description: 'Project description' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: '2026-11-25', description: 'Project start date (YYYY-MM-DD' })
    @IsDateString()
    @IsNotEmpty()
    startDate: string;

    @ApiProperty({ example: '2026-12-31', description: 'Project end date (YYYY-MM-DD' })
    @IsDateString()
    @IsNotEmpty()
    endDate: string;
}