import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity.js';  
import { ProjectsService } from './projects.service.js';
import { ProjectsControler } from './projects.controller.js';

@Module({
    imports: [TypeOrmModule.forFeature([Project])],
    controllers: [ProjectsControler],
    providers: [ProjectsService],
    exports: [TypeOrmModule, ProjectsService],
})
export class ProjectsModule {}
