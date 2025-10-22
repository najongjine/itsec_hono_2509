import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("t_test1_pkey", ["id"], { unique: true })
@Entity("t_test1", { schema: "public" })
export class TTest1 {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("character varying", { name: "name", length: 255 })
  name: string;

  @Column("numeric", { name: "price", precision: 10, scale: 2 })
  price: string;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;
}
