ALTER TABLE ai_generation_jobs
    ADD COLUMN group_id BIGINT REFERENCES teacher_groups(id) ON DELETE CASCADE,
    ADD COLUMN original_filename VARCHAR(255);

CREATE INDEX idx_ai_jobs_group_id ON ai_generation_jobs(group_id);
