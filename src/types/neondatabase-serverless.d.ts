// Type declarations for @neondatabase/serverless
declare module "@neondatabase/serverless" {
  export interface NeonClient {
    /** Execute a SQL query.
     * @param sql The SQL statement.
     * @param params Optional positional parameters.
     */
    query: (sql: string, params?: unknown[]) => Promise<any>;
  }
  /** Create a Neon client from a connection string.
   * @param connectionString The PostgreSQL connection URL.
   */
  export function neon(connectionString: string): NeonClient;
}
