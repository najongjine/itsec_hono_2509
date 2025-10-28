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

  @Column("character varying", {
    name: "real_name",
    nullable: true,
    default: () => "''",
  })
  realName: string | null;

  @Column("character varying", {
    name: "profile_url",
    nullable: true,
    default: () => "''",
  })
  profileUrl: string | null;

  @Column("character varying", {
    name: "uid",
    nullable: true,
    default: () => "''",
  })
  uid: string | null;

  @Column("character varying", {
    name: "email",
    nullable: true,
    default: () => "''",
  })
  email: string | null;

  @Column("character varying", {
    name: "display_name",
    nullable: true,
    default: () => "''",
  })
  displayName: string | null;

  @Column("character varying", {
    name: "provider_id",
    nullable: true,
    default: () => "''",
  })
  providerId: string | null;

  @Column("character varying", {
    name: "metadata",
    nullable: true,
    default: () => "''",
  })
  metadata: string | null;

  @OneToMany(() => TBoard, (tBoard) => tBoard.user)
  tBoards: TBoard[];
}
