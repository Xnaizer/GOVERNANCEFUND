CREATE OR REPLACE FUNCTION lock_sealed_program_fields()
RETURNS TRIGGER AS $$
BEGIN
  
  IF OLD.status IN ('APPROVED', 'DRAWABLE', 'MILESTONE_ACHIEVED', 'FROZEN', 'FRAUD_CONFIRMED', 'COMPLETED') THEN

    IF (TG_OP = 'DELETE') THEN
      RAISE EXCEPTION 'Fraud Detection: locked program cannot be deleted (status: %)', OLD.status;
    END IF;

    IF NEW."programId"            IS DISTINCT FROM OLD."programId"
       OR NEW."title"             IS DISTINCT FROM OLD."title"
       OR NEW."description"       IS DISTINCT FROM OLD."description"
       OR NEW."totalBudget"       IS DISTINCT FROM OLD."totalBudget"
       OR NEW."picWallet"         IS DISTINCT FROM OLD."picWallet"
       OR NEW."milestoneCount"    IS DISTINCT FROM OLD."milestoneCount"
       OR NEW."province"          IS DISTINCT FROM OLD."province"
       OR NEW."regency"           IS DISTINCT FROM OLD."regency"
       OR NEW."district"          IS DISTINCT FROM OLD."district"
       OR NEW."locationAddress"   IS DISTINCT FROM OLD."locationAddress"
       OR NEW."executorName"      IS DISTINCT FROM OLD."executorName"
       OR NEW."executorRegistration" IS DISTINCT FROM OLD."executorRegistration"
       OR NEW."category"          IS DISTINCT FROM OLD."category"
       OR NEW."institutionName"   IS DISTINCT FROM OLD."institutionName"
       OR NEW."fiscalYear"        IS DISTINCT FROM OLD."fiscalYear"
       OR NEW."programHash"       IS DISTINCT FROM OLD."programHash"
    THEN
      RAISE EXCEPTION 'Fraud Detection: sealed program data is immutable (status: %)', OLD.status;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_program_immutability ON "Program";

CREATE TRIGGER check_program_immutability
BEFORE UPDATE OR DELETE ON "Program"
FOR EACH ROW EXECUTE FUNCTION lock_sealed_program_fields();