import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	return knex.schema.alterTable("Applicant", (table: Knex.TableBuilder) => {
		table.dropColumn("CreatedBy");
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable("Applicant");
}
