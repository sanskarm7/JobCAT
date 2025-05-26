-- Insert sample companies
INSERT INTO companies (name, careers_url, logo_url) VALUES
('Google', 'https://careers.google.com/jobs/results/', 'https://logo.clearbit.com/google.com'),
('Microsoft', 'https://careers.microsoft.com/us/en/search-results', 'https://logo.clearbit.com/microsoft.com'),
('Apple', 'https://jobs.apple.com/en-us/search', 'https://logo.clearbit.com/apple.com')
ON CONFLICT (careers_url) DO NOTHING;

-- Insert sample scraping rules (manual ones for Phase 1)
INSERT INTO scraping_rules (company_id, selectors, is_ai_generated, is_verified, notes) 
SELECT 
    c.id,
    CASE 
        WHEN c.name = 'Google' THEN '{"jobContainer": ".gc-card", "title": ".gc-card__title", "location": ".gc-card__location", "link": ".gc-card__title a"}'::jsonb
        WHEN c.name = 'Microsoft' THEN '{"jobContainer": ".job-item", "title": ".job-title", "location": ".job-location", "link": ".job-title a"}'::jsonb
        WHEN c.name = 'Apple' THEN '{"jobContainer": ".table-row", "title": ".table-col-1 a", "location": ".table-col-2", "link": ".table-col-1 a"}'::jsonb
    END,
    false,
    true,
    'Manually created rule for Phase 1'
FROM companies c
WHERE c.name IN ('Google', 'Microsoft', 'Apple')
AND NOT EXISTS (
    SELECT 1 FROM scraping_rules sr WHERE sr.company_id = c.id
); 