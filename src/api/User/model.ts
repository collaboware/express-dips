import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  webId: string

  @Column({ nullable: true })
  name?: string

  @OneToMany(() => UserSession, (session) => session.user)
  @JoinColumn()
  sessions: UserSession[]
}

@Entity()
export class UserSession extends BaseEntity {
  @PrimaryColumn()
  id: string

  @ManyToOne(() => User, (user) => user.sessions)
  user: User

  @Column({ nullable: true })
  session: string
}
