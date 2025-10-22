import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TBoard } from "./TBoard";

@Index("t_user_pkey", ["id"], { unique: true })
@Entity("t_user", { schema: "public" })
export class TUser {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "username",
    nullable: true,
    default: () => "''''''",
  })
  username: string | null;

  @Column("character varying", {
    name: "password",
    nullable: true,
    default: () => "''''''",
  })
  password: string | null;

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

  @OneToMany(() => TBoard, (tBoard) => tBoard.user)
  tBoards: TBoard[];
}
