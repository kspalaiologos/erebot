WITH task_solutions AS (
  SELECT
    s.submitter_id,
    t.game_id AS round_id,
    SUM(t.points) AS total_points,
    SUM(s.score) AS total_bytes
  FROM solutions s
  JOIN tasks t ON s.task_id = t.id
  GROUP BY s.submitter_id, t.game_id
)
SELECT
  '- <@' || submitter_id || '>: ' || 
  total_points || ' point' || CASE WHEN total_points = 1 THEN '' ELSE 's' END || ', ' ||
  total_bytes || ' byte' || CASE WHEN total_bytes = 1 THEN '' ELSE 's' END AS leaderboard_entry
FROM task_solutions
WHERE round_id = ?
ORDER BY total_points DESC, total_bytes ASC;