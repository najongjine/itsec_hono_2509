import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TUser } from "./TUser";
import { TBoardImgs } from "./TBoardImgs";

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

  @Column("character varying", {
    name: "html_content",
    nullable: true,
    default: () => "''",
  })
  htmlContent: string | null;

  @Column("jsonb", { name: "json_content", nullable: true })
  jsonContent: object | null;

  @ManyToOne(() => TUser, (tUser) => tUser.tBoards, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: TUser;

  @OneToMany(() => TBoardImgs, (tBoardImgs) => tBoardImgs.board)
  tBoardImgs: TBoardImgs[];
}
