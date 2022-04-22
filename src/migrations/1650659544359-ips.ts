import { MigrationInterface, QueryRunner } from "typeorm";

export class ips1650659544359 implements MigrationInterface {
    name = 'ips1650659544359'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "webId" character varying NOT NULL, "name" character varying, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_session" ("id" character varying NOT NULL, "session" character varying, "userId" integer, CONSTRAINT "PK_adf3b49590842ac3cf54cac451a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vocabulary" ("id" SERIAL NOT NULL, "link" character varying, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying, CONSTRAINT "PK_65dbd74f76cee79778299a2a21b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rdf_class" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying, "vocabId" integer, CONSTRAINT "PK_b830a1c5aa146dd09385c6cf62a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "property" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying, "domainId" integer, "rangeId" integer, "vocabId" integer, CONSTRAINT "PK_d80743e6191258a5003d5843b4f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vocabulary_contributors_user" ("vocabularyId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_145b6e6c33fe4dc99028fbb69af" PRIMARY KEY ("vocabularyId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c577e101ebfc38d62593f05df2" ON "vocabulary_contributors_user" ("vocabularyId") `);
        await queryRunner.query(`CREATE INDEX "IDX_6f38c6b49fd986666344650f4f" ON "vocabulary_contributors_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "user_session" ADD CONSTRAINT "FK_b5eb7aa08382591e7c2d1244fe5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rdf_class" ADD CONSTRAINT "FK_cb485a4f00e0b87794285f8d333" FOREIGN KEY ("vocabId") REFERENCES "vocabulary"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "property" ADD CONSTRAINT "FK_dc1afe45fc76cf45884db98dd16" FOREIGN KEY ("domainId") REFERENCES "rdf_class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "property" ADD CONSTRAINT "FK_925e002e6c7e16d91f4233eb7f9" FOREIGN KEY ("rangeId") REFERENCES "rdf_class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "property" ADD CONSTRAINT "FK_b46962dcbff2dc7a5a6da32bb47" FOREIGN KEY ("vocabId") REFERENCES "vocabulary"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vocabulary_contributors_user" ADD CONSTRAINT "FK_c577e101ebfc38d62593f05df2d" FOREIGN KEY ("vocabularyId") REFERENCES "vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "vocabulary_contributors_user" ADD CONSTRAINT "FK_6f38c6b49fd986666344650f4f2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vocabulary_contributors_user" DROP CONSTRAINT "FK_6f38c6b49fd986666344650f4f2"`);
        await queryRunner.query(`ALTER TABLE "vocabulary_contributors_user" DROP CONSTRAINT "FK_c577e101ebfc38d62593f05df2d"`);
        await queryRunner.query(`ALTER TABLE "property" DROP CONSTRAINT "FK_b46962dcbff2dc7a5a6da32bb47"`);
        await queryRunner.query(`ALTER TABLE "property" DROP CONSTRAINT "FK_925e002e6c7e16d91f4233eb7f9"`);
        await queryRunner.query(`ALTER TABLE "property" DROP CONSTRAINT "FK_dc1afe45fc76cf45884db98dd16"`);
        await queryRunner.query(`ALTER TABLE "rdf_class" DROP CONSTRAINT "FK_cb485a4f00e0b87794285f8d333"`);
        await queryRunner.query(`ALTER TABLE "user_session" DROP CONSTRAINT "FK_b5eb7aa08382591e7c2d1244fe5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6f38c6b49fd986666344650f4f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c577e101ebfc38d62593f05df2"`);
        await queryRunner.query(`DROP TABLE "vocabulary_contributors_user"`);
        await queryRunner.query(`DROP TABLE "property"`);
        await queryRunner.query(`DROP TABLE "rdf_class"`);
        await queryRunner.query(`DROP TABLE "vocabulary"`);
        await queryRunner.query(`DROP TABLE "user_session"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
