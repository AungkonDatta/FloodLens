import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DrainagePoint } from "@/modules/drainage-points/entities/drainage-point.entity";

// Only these columns are sent to the client (created_at stays internal).
const PUBLIC_FIELDS = {
  id: true,
  label: true,
  capacity: true,
  defaultStatus: true,
  streetId: true,
} as const;

@Injectable()
export class DrainagePointsService {
  constructor(
    @InjectRepository(DrainagePoint)
    private readonly repo: Repository<DrainagePoint>,
  ) {}

  findAll(streetId?: string) {
    return this.repo.find({
      select: PUBLIC_FIELDS,
      where: streetId ? { streetId } : {},
      order: { label: "ASC", id: "ASC" },
    });
  }

  async findOne(id: string) {
    const point = await this.repo.findOne({
      select: PUBLIC_FIELDS,
      where: { id },
    });
    if (!point) {
      throw new NotFoundException(`Drainage point ${id} not found`);
    }
    return point;
  }
}
