import { DataSource } from "typeorm";
import { dataSourceOptions } from "./database.config";

// Used by the TypeORM CLI (migration:generate) and by the seed script.
export default new DataSource(dataSourceOptions);
