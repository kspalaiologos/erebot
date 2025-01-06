WITH task_solvers AS (
  SELECT
    t.id AS task_id,
    GROUP_CONCAT('<@' || s.submitter_id, '>, ') AS solvers
  FROM tasks t
  LEFT JOIN solutions s ON t.id = s.task_id
  GROUP BY t.id
),
min_task_id AS (
  SELECT MIN(id) AS min_id
  FROM tasks
  WHERE game_id = ?
)
SELECT
  (t.id - mt.min_id + 1) || '. ' || 
  CASE
    WHEN ts.solvers IS NULL THEN 'Solved by nobody.'
    ELSE 'Solved by ' || ts.solvers || '>.'
  END AS task_summary
FROM tasks t
LEFT JOIN task_solvers ts ON t.id = ts.task_id
CROSS JOIN min_task_id mt
WHERE t.game_id = ?
ORDER BY t.id;