import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

@Entity("intersections")
@Unique("UQ_intersections_position", ["x", "y"]) // two intersections cannot share a position
export class Intersection {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "double precision" })
  x!: number;

  @Column({ type: "double precision" })
  y!: number;

  @Column({ name: "elevation_m", type: "double precision" })
  elevationM!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
