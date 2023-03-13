import type { Knex } from "knex";
import IWriter from "../interface/base/IWriter";
import IReader from "../interface/base/IReader";

type BaseRepository<T> = IWriter<T> & IReader<T>

export abstract class KnexRepository<T> implements BaseRepository<T> {
    public readonly knex: Knex;
    public readonly tableName: string;
    constructor(knex: Knex, tableName: string) {
        this.knex = knex;
        this.tableName = tableName;
    }

    // Shortcut for Query Builder call
    public get qb(): Knex.QueryBuilder {
        return this.knex(this.tableName);
    }

    async create(item: any) {
        return await await this.knex.transaction(async (trx) => {
            await this.qb.insert(item, ["GUID"]).transacting(trx);
            return await this.qb
                .select("GUID")
                .orderBy("created_at", "desc")
                .first()
                .transacting(trx);
        });
    }

    createMany(items: T[]): Promise<T[]> {
        return this.qb.insert<T>(items) as Promise<T[]>;
    }

    update(id: string, item: Partial<T>): Promise<boolean> {
        return this.qb
            .where("GUID", id)
            .update(item);
    }

    updateByCondition(dk: Partial<T>, item: Partial<T>): Promise<boolean> {
        return this.qb
            .where(dk)
            .update(item);
    }

    delete(id: string): Promise<boolean> {
        return this.qb
            .where("GUID", id)
            .del();
    }


    findByCondition(item: Partial<T>): Promise<T[]> {
        return this.qb
            .where(item)
            .select();
    }

    findAll(): Promise<T[]> {
        return this.qb.select();

    }

    findOne(id: string | Partial<T>): Promise<T> {
        return typeof id === "string"
            ? this.qb.where("GUID", id).first()
            : this.qb.where(id).first();
    }

    async findAccountByUsername(Username: string): Promise<T> {
        return await this.qb.where("Username", Username).first()
    }

    findToken(token: string): Promise<T> {
        return this.qb.where("TokenLogin", token).first()
    }

    async exist(id: string | Partial<T>): Promise<boolean> {
        const query = this.qb.select<[{ count: number }]>(this.knex.raw("COUNT(*)::integer as count"));

        if (typeof id !== "string") {
            query.where(id);
        } else {
            query.where("GUID", id);
        }

        const exist = await query.first();

        return exist?.count !== 0;
    }
}