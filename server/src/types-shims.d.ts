declare module 'pg';
declare module 'dotenv';

// Minimal helpers to allow using Pool without full types in this converted codepath.
declare module 'pg' {
  export class Pool {
    constructor(opts?: any);
    query(text: string, params?: any[]): Promise<any>;
    connect(): Promise<any>;
    end(): Promise<void>;
  }
}
