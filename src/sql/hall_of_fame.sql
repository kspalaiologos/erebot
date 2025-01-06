WITH TaskScores AS (
  SELECT
    s.submitter_id,
    t.game_id,
    SUM(t.points) AS total_points,
    SUM(s.score) AS cumulative_score
  FROM solutions s
  JOIN tasks t ON s.task_id = t.id
  WHERE t.game_id NOT IN (
    SELECT id
    FROM games
    WHERE end_time_utc IS NOT NULL AND end_time_utc > unixepoch('now')
  )
  GROUP BY s.submitter_id, t.game_id
),
Winners AS (
  SELECT
    game_id,
    submitter_id,
    total_points,
    cumulative_score
  FROM (
    SELECT ts.*,
      RANK() OVER (
        PARTITION BY ts.game_id
        ORDER BY ts.total_points DESC, ts.cumulative_score ASC
      ) AS rank
    FROM TaskScores ts
  )
  WHERE rank = 1
),
HallOfFame AS (
  SELECT
    w.submitter_id,
    COUNT(w.game_id) AS games_won,
    GROUP_CONCAT(w.game_id || CASE WHEN w.game_id > 1 THEN '' ELSE '' END, ', ') AS won_games
  FROM Winners w
  GROUP BY w.submitter_id
)
SELECT
  '<@' || submitter_id || '>: Won game' || CASE WHEN won_games LIKE '%,%' THEN 's ' ELSE ' ' END || won_games AS hall_of_fame
FROM HallOfFame
ORDER BY games_won DESC
LIMIT 10 OFFSET ?