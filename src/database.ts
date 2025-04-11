import sqlite3, { Database } from 'sqlite3';
import fs from 'fs';

const sqlCache = new Map<string, string>();
const getCachedExpression = (key: string) => {
  if (!sqlCache.has(key)) {
    const sql = fs.readFileSync(`src/sql/${key}.sql`, 'utf8');
    sqlCache.set(key, sql);
  }
  return sqlCache.get(key)!;
}

export async function openDb() {
  return new sqlite3.Database('ere.db');
}

export type GameRow = {
  id: number,
  name: string,
  start_time_utc: string | null,
  end_time_utc: string | null,
  interpreter: Buffer,
  interpreter_type: string
};

export type TaskRow = {
  id: number,
  game_id: number,
  description: string,
  points: number,
  score_program: string
};

export type SolutionRow = {
  id: number,
  submitter_id: string,
  content: Buffer,
  task_id: number,
  score: number
};

export type ValidationQueueRow = {
  id: number,
  submitter_id: string,
  content: Buffer,
  task_id: number,
  score: number
}

export type MessageRow = {
  id: number,
  recipient_id: string,
  message: string
}

const dbGet = <T,>(db: Database, sql: string, params: any[] = []) => {
  return new Promise<T | null>((resolve, _) => {
    db.get(sql, params, (err : Error | null, row : T) => {
      if (err) {
        console.error('DB Error: ' + err);
        resolve(null);
      }
      resolve(row);
    });
  });
}

const dbAll = <T,>(db: Database, sql: string, params: any[] = [], field: string | null = null) => {
  return new Promise<T[]>((resolve, _) => {
    db.all(sql, params, (err : Error | null, rows : any[]) => {
      if (err) {
        console.error('DB Error: ' + err);
        resolve([]);
      }
      field === null ? resolve(rows) : resolve(rows.map(row => row[field]));
    });
  });
}

export const fetchGameRow = async (db: Database, id: number | null) =>
  id === null
    ? dbGet<GameRow>(db, 'SELECT * FROM games ORDER BY id DESC LIMIT 1')
    : dbGet<GameRow>(db, 'SELECT * FROM games WHERE id = ?', [id]);

export const fetchTasksForRound = async (db: Database, roundId: number) =>
  dbAll<TaskRow>(db, 'SELECT * FROM tasks WHERE game_id = ? ORDER BY id ASC', [roundId]);

export const fetchLeaderboardForRound = async (db: Database, roundId: number) =>
  dbAll<string[]>(db, getCachedExpression('leaderboard_for_round'), [roundId], 'leaderboard_entry');

export const fetchSolvedByTableForRound = async (db: Database, roundId: number) =>
  dbAll<string[]>(db, getCachedExpression('solved_by_table_for_round'), [roundId, roundId], 'task_summary');

export const fetchHallOfFame = async (db: Database, page: number) =>
  dbAll<string[]>(db, getCachedExpression('hall_of_fame'), [10 * (page - 1)], 'hall_of_fame');

export const yankValidationQueue = async (db: Database, userId: string, taskId: number) =>
  db.run('DELETE FROM validation_queue WHERE submitter_id = ? AND task_id = ?', [userId, taskId]);

export const countValidationQueue = async (db: Database) =>
  dbGet<{count: number}>(db, 'SELECT COUNT(*) AS count FROM validation_queue');

export const insertGame = async (db: Database, name: string, interpreter: Buffer, interpreterType: string, startTime: number, endTime: number) => {
  db.run('INSERT INTO games (name, interpreter, interpreter_type, start_time_utc, end_time_utc) VALUES (?, ?, ?, ?, ?)', [name, interpreter, interpreterType, startTime, endTime]);
  return dbGet<{id: number}>(db, 'SELECT last_insert_rowid() AS id');
}

export const insertTask = async (db: Database, gameId: number, description: string, points: number, scoreProgram: string) => {
  db.run('INSERT INTO tasks (game_id, description, points, score_program) VALUES (?, ?, ?, ?)', [gameId, description, points, scoreProgram]);
  return dbGet<{id: number}>(db, 'SELECT last_insert_rowid() AS id');
}

export const insertValidationQueue = async (db: Database, userId: string, content: Buffer, taskId: number, score: number) => {
  db.run('INSERT INTO validation_queue (submitter_id, content, task_id, score) VALUES (?, ?, ?, ?)', [userId, content, taskId, score]);
  return dbGet<{id: number}>(db, 'SELECT last_insert_rowid() AS id');
}

export const peekValidationQueue = async (db: Database) => {
  const row = await dbGet<ValidationQueueRow>(db, 'SELECT * FROM validation_queue ORDER BY id ASC LIMIT 1');
  return row ? row : null;
}

export const popValidationQueue = async (db: Database, row: ValidationQueueRow) =>
  db.run('DELETE FROM validation_queue WHERE id = ?', [row.id]);

export const transferValidationQueue = async (db: Database, row: ValidationQueueRow) => {
  const game = await fetchGameRow(db, null);
  const tasks = await fetchTasksForRound(db, game!.id);
  const task = tasks[row.task_id - 1];
  db.run('INSERT INTO solutions (submitter_id, content, task_id, score) VALUES (?, ?, ?, ?)', [row.submitter_id, row.content, task.id, row.score]);
  popValidationQueue(db, row);
}
