import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Street } from "@/modules/streets/entities/street.entity";
import { DrainageStatus } from "@/modules/drainage-points/drainage-status.enum";

@Entity("drainage_points")
@Unique("UQ_drainage_points_street_label", ["streetId", "label"]) // label is unique within a street
@Index("IDX_drainage_points_street_id", ["streetId"])
@Check("CHK_drainage_points_capacity", '"capacity" >= 0')
export class DrainagePoint {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 100 })
  label!: string;

  @Column({ type: "double precision" })
  capacity!: number;

  // Only the DEFAULT status is stored. A user's block/unblock is a browser-session change.
  @Column({
    name: "default_status",
    type: "enum",
    enum: DrainageStatus,
    enumName: "drainage_status",
    default: DrainageStatus.WORKING,
  })
  defaultStatus!: DrainageStatus;

  @Column({ name: "street_id", type: "uuid" })
  streetId!: string;

  @ManyToOne(() => Street, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "street_id" })
  street!: Street;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
