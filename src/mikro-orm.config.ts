import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/postgresql";
import path from "path";

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        patter: "/^[\w-]+\d+\.[tj]s$/",
    },
    allowGlobalContext: true,
    entities: [Post],
    dbName: "lireddit",
    type: "postgresql",
    user: "postgres",
    password: "root",
    debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];