import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TUser } from "./TUser";

@Index("t_board_pkey", ["id"], { unique: true })
@Entity("t_board", { schema: "public" })
export class TBoard {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("timestamp with time zone", {
    name: "created_dt",
    nullable: true,
    default: () => "now()",
  })
  createdDt: Date | null;

  @Column("timestamp with time zone", {
    name: "updated_dt",
    nullable: true,
    default: () => "now()",
  })
  updatedDt: Date | null;

  @Column("character varying", {
    name: "title",
    nullable: true,
    default: () => "''''''",
  })
  title: string | null;

  @Column("character varying", {
    name: "content",
    nullable: true,
    default: () => "''''''",
  })
  content: string | null;

  @ManyToOne(() => TUser, (tUser) => tUser.tBoards, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: TUser;
}
