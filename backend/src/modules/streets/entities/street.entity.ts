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
import { Intersection } from "@/modules/intersections/entities/intersection.entity";

@Entity("streets")
@Unique("UQ_streets_endpoints", ["startIntersectionId", "endIntersectionId"])
@Index("IDX_streets_start_intersection_id", ["startIntersectionId"])
@Index("IDX_streets_end_intersection_id", ["endIntersectionId"])
@Check("CHK_streets_length_positive", '"length_m" > 0')
@Check("CHK_streets_runoff_range", '"runoff_factor" >= 0 AND "runoff_factor" <= 1')
@Check(
  "CHK_streets_endpoints_differ",
  '"start_intersection_id" <> "end_intersection_id"',
)
@Check(
  "CHK_streets_endpoints_ordered",
  '"start_intersection_id" < "end_intersection_id"',
)
export class Street {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ name: "length_m", type: "double precision" })
  lengthM!: number;

  @Column({ name: "runoff_factor", type: "double precision" })
  runoffFactor!: number;

  @Column({ name: "start_intersection_id", type: "uuid" })
  startIntersectionId!: string;

  @Column({ name: "end_intersection_id", type: "uuid" })
  endIntersectionId!: string;

  @ManyToOne(() => Intersection, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "start_intersection_id" })
  startIntersection!: Intersection;

  @ManyToOne(() => Intersection, { nullable: false, onDelete: "RESTRICT" })
  @JoinColumn({ name: "end_intersection_id" })
  endIntersection!: Intersection;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
