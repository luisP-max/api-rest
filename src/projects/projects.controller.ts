import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateProjectDto } from './dto/create-project.dto.js'
import { UpdateProjectDto } from './dto/update-project.dto.js'
import { ProjectsService } from './projects.service.js'

@ApiTags('Projects')
@Controller('projects')
export class ProjectsControler {
    constructor(private readonly projectsService: ProjectsService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new project' })
    @ApiResponse({ status: 201, description: 'Project created successfully.' })
    create(@Body() createProjectDto: CreateProjectDto) {
        return this.projectsService.create(createProjectDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all projects' })
    findAll() {
        return this.projectsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a project by ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.projectsService.findOne(id);
    }

    @Get(':id/progress')
    @ApiOperation({ summary: 'Calculate project completion percentage based on completed tasks' })
    getProgress(@Param('id', ParseIntPipe) id: number) {
        return this.projectsService.getProjectProgress(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a project by ID'})
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProjectDto: UpdateProjectDto,
    ) {
        return this.projectsService.update(id, updateProjectDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a project (only if it has no pending tasks' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.projectsService.remove(id); 
    }
}