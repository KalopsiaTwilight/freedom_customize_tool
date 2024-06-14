import { Database } from "sqlite3";

export const allAsync = (db: Database, sql: string, ...params: any[]) => {
  return new Promise<any[]>((res, rej) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        rej(err);
      }
      res(rows);
    })
  });
}

export const getAsync = (db: Database, sql: string, ...params: any[]) => {
  return new Promise<any>((res, rej) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        rej(err);
      }
      res(row);
    })
  });
}

export const execAsync = (db: Database, sql: string) => {
  return new Promise<void>((res, rej) => {
    db.exec(sql, (err) => {
      if (err) { rej(err); }
      res();
    })
  })
}