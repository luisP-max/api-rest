import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Task } from '../../tasks/entities/task.entity.js';

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 150 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string; 

    @Column({ name: 'start_date', type: 'date' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date' })
    endDate: Date;

    @OneToMany( 'Task', 'project')
    tasks: Task[];
}