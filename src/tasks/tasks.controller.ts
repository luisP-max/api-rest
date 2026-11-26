import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { FilterTasksDto } from './dto/filter-tasks.dto.js';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TasksService } from './tasks.service.js';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new task for a project' })
    @ApiResponse({ status: 201, description: 'Task created successfully.' })
    create(@Body() createTaskDto: CreateTaskDto) {
        return this.tasksService.create(createTaskDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all tasks with optional filters (status, priority)' })
    findAll(@Query() filterDto: FilterTasksDto) {
        return this.tasksService.findAll(filterDto);
    }

    @Get('overdue')
    @ApiOperation({ summary: 'Get overdue tasks that are not completed' })
    findOverdue() {
        return this.tasksService.findOverdueTasks();
    }

    @Get('project/:projectId')
    @ApiOperation({ summary: 'Get all tasks belonging to a specific project' })
    findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
        return this.tasksService.findByProject(projectId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a task by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.tasksService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a task by ID' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTaskDto: UpdateTaskDto,
    ) {
        return this.tasksService.update(id, updateTaskDto);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Change only the status of a task' })
    updateStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    ) {
        return this.tasksService.updateStatus(id, updateTaskStatusDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a task by ID' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.tasksService.remove(id);
    }
}
