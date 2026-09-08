-- CreateEnum
CREATE TYPE "province_kind" AS ENUM ('prefecture', 'province');

-- CreateTable
CREATE TABLE "provinces" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "province_kind" NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "provinces_name_key" ON "provinces"("name");

-- Reference data. It ships with the table rather than in a seed script so
-- every environment that runs migrations has the list, test databases too.
INSERT INTO "provinces" ("code", "name", "kind") VALUES
    ('vientiane-prefecture', 'Vientiane Prefecture', 'prefecture'),
    ('attapeu',             'Attapeu',              'province'),
    ('bokeo',               'Bokeo',                'province'),
    ('bolikhamsai',         'Bolikhamsai',          'province'),
    ('champasak',           'Champasak',            'province'),
    ('houaphanh',           'Houaphanh',            'province'),
    ('khammouane',          'Khammouane',           'province'),
    ('luang-namtha',        'Luang Namtha',         'province'),
    ('luang-prabang',       'Luang Prabang',        'province'),
    ('oudomxay',            'Oudomxay',             'province'),
    ('phongsaly',           'Phongsaly',            'province'),
    ('salavan',             'Salavan',              'province'),
    ('savannakhet',         'Savannakhet',          'province'),
    ('sekong',              'Sekong',               'province'),
    ('vientiane-province',  'Vientiane Province',   'province'),
    ('sainyabuli',          'Sainyabuli',           'province'),
    ('xaisomboun',          'Xaisomboun',           'province'),
    ('xieng-khouang',       'Xieng Khouang',        'province');
