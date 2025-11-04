import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TBoard } from "./TBoard";

@Index("t_board_imgs_pkey", ["id"], { unique: true })
@Entity("t_board_imgs", { schema: "public" })
export class TBoardImgs {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", {
    name: "imgurl",
    nullable: true,
    default: () => "''",
  })
  imgurl: string | null;

  @Column("character varying", {
    name: "original_filename",
    nullable: true,
    default: () => "''",
  })
  originalFilename: string | null;

  @Column("character varying", {
    name: "unique_filename",
    nullable: true,
    default: () => "''",
  })
  uniqueFilename: string | null;

  @Column("character varying", {
    name: "minetype",
    nullable: true,
    default: () => "''",
  })
  minetype: string | null;

  @Column("integer", { name: "filesize", nullable: true, default: () => "0" })
  filesize: number | null;

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

  @ManyToOne(() => TBoard, (tBoard) => tBoard.tBoardImgs, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "board_id", referencedColumnName: "id" }])
  board: TBoard;
}
