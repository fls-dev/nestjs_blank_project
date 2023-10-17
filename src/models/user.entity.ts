import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,UpdateDateColumn,OneToMany,JoinTable} from 'typeorm';
import {SessionControl} from "./session-control.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    login: string;

    @Column({ type: "varchar", length:700})
    password: string;

    @Column({ type: "varchar", length:255})
    firstName: string;

    @Column({ type: "varchar", length:255})
    lastName: string;

    @Column({ type: "varchar", length:55})
    phone: string;

    @Column({ type: "varchar", length:55})
    add_phone: string;

    @Column({nullable:true})
    position: string;

    @Column({ default:"USER" })
    group: string;

    @Column({ type: "varchar", default:"/public/img/avatar.png" })
    link_logo: string;

    @Column({ type: "varchar"})
    location: string;

    @Column({ default:"en" })
    lang: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;
    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    @OneToMany(() => SessionControl, (s) => s.userId, {cascade: true})
    sessions: SessionControl[]

}

