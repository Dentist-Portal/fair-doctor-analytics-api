-- CreateEnum
CREATE TYPE "PatientMetricType" AS ENUM ('missing_document', 'ohne_leistung');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('mvz_karten_fehlen', 'karten_ohne_leistung');

-- CreateTable
CREATE TABLE "locations" (
    "location_id" SERIAL NOT NULL,
    "location_name" VARCHAR(255) NOT NULL,
    "zipcode" VARCHAR(20),
    "dental_units" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "patient_metrics" (
    "patient_metric_id" BIGSERIAL NOT NULL,
    "location_id" INTEGER NOT NULL,
    "metric_date" DATE NOT NULL,
    "metric_type" "PatientMetricType" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_metrics_pkey" PRIMARY KEY ("patient_metric_id")
);

-- CreateTable
CREATE TABLE "file_operations" (
    "file_id" BIGSERIAL NOT NULL,
    "location_id" INTEGER NOT NULL,
    "file_type" "FileType" NOT NULL,
    "file_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_operations_pkey" PRIMARY KEY ("file_id")
);

-- CreateTable
CREATE TABLE "kpi_types" (
    "kpi_type_id" SERIAL NOT NULL,
    "kpi_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_types_pkey" PRIMARY KEY ("kpi_type_id")
);

-- CreateTable
CREATE TABLE "daily_metrics" (
    "metric_id" BIGSERIAL NOT NULL,
    "location_id" INTEGER NOT NULL,
    "metric_date" DATE NOT NULL,
    "kpi_type_id" INTEGER NOT NULL,
    "metric_value" DECIMAL(15,2),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_metrics_pkey" PRIMARY KEY ("metric_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "locations_location_name_key" ON "locations"("location_name");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_types_kpi_name_key" ON "kpi_types"("kpi_name");

-- AddForeignKey
ALTER TABLE "patient_metrics" ADD CONSTRAINT "patient_metrics_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_operations" ADD CONSTRAINT "file_operations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_metrics" ADD CONSTRAINT "daily_metrics_kpi_type_id_fkey" FOREIGN KEY ("kpi_type_id") REFERENCES "kpi_types"("kpi_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_metrics" ADD CONSTRAINT "daily_metrics_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;
