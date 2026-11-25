import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import type { Project } from '../../projects/entities/project.entity.js'
import { TaskStatus } from '../enums/task-status.enum.js'
import { TaskPriority } from '../enums/task-priority.enum.js'

@Entity(' tasks ')
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 150 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING,}) status: TaskStatus;

    @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM,}) priority: TaskPriority;

    @Column({ name: 'due_date', type: 'date' })
    dueDate: Date;

    @Column({ name: 'project_id' })
    projectId: number;

    @ManyToOne('Project', 'tasks', {
        onDelete: 'RESTRICT',
    })

    @JoinColumn({ name: 'project_id' })
    project: Project;
}