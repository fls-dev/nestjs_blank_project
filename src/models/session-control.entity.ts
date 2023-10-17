import {Column, Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn} from "typeorm";
import {timestamp} from "rxjs";
import {User} from "./user.entity";

@Entity('session-control')
export class SessionControl {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    refreshToken: string;

    @Column()
    ua: string;

    @Column({type:"timestamp", nullable: true})
    expiresIn: Date;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;
    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    @ManyToOne(() => User, (us) => us.sessions)
    @JoinColumn({ name: 'userId' })
    user: User;
}
