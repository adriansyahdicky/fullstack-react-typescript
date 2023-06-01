import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";

const main = async () => {
    const orm = MikroORM.init(mikroOrmConfig);
    (await orm).getMigrator().up();
    const post = (await orm).em.fork({}).create(Post, {
        title: "joko",
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    (await orm).em.persistAndFlush(post);
    console.log('success insert');
}

main().catch(err => {
    console.error(err);
});