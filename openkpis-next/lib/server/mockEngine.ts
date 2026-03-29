import { faker } from '@faker-js/faker';

// Define the Data Types the AI can request when building a database schema
export type MockDataType = 'id' | 'date' | 'string' | 'number' | 'currency' | 'boolean' | 'email' | 'product' | 'geo';

export interface ColumnDefinition {
  name: string;
  type: MockDataType;
}

export interface SchemaDefinition {
  tableName: string;
  columns: ColumnDefinition[];
}

/**
 * OKPI-2.2: The Core Mock Engine
 * This service receives missing schema definitions dynamically from Agent 2.
 * It uses Faker.js to immediately spin up an array of relational data
 * that will be fed into DuckDB.
 */
export function generateMockTableData(schema: SchemaDefinition, rowCount: number = 300): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = [];
  
  // Seed faker to ensure deterministic data generation if you want reproducible dashboards
  faker.seed(123);

  for (let i = 0; i < rowCount; i++) {
    const row: Record<string, unknown> = {};
    
    // Base time progression to create realistic time-series charting
    // Spaced out over the last 90 days
    const baseDate = faker.date.recent({ days: 90 }); 

    for (const col of schema.columns) {
      switch (col.type) {
        case 'id':
          row[col.name] = faker.string.uuid();
          break;
        case 'date':
          // We map dates chronologically using the iterator index to ensure timeseries look good on line charts
          const progressiveDate = new Date(baseDate.getTime() + (i * 1000 * 60 * 60 * 2)); // add 2 hours per row
          row[col.name] = progressiveDate.toISOString().split('T')[0]; // Format 'YYYY-MM-DD'
          break;
        case 'string':
          row[col.name] = faker.word.noun();
          break;
        case 'product':
          row[col.name] = faker.commerce.productName();
          break;
        case 'geo':
          row[col.name] = faker.location.country();
          break;
        case 'number':
          row[col.name] = faker.number.int({ min: 10, max: 1500 });
          break;
        case 'currency':
          row[col.name] = parseFloat(faker.finance.amount({ min: 50, max: 5000, dec: 2 }));
          break;
        case 'email':
          row[col.name] = faker.internet.email();
          break;
        case 'boolean':
          row[col.name] = faker.datatype.boolean() ? 'True' : 'False';
          break;
        default:
          row[col.name] = faker.lorem.word();
      }
    }
    data.push(row);
  }
  
  // We sort by date if a date column exists so time-series charts (like Line and Area) render cleanly
  const dateCol = schema.columns.find(c => c.type === 'date');
  if (dateCol) {
    data.sort((a, b) => new Date(a[dateCol.name] as string).getTime() - new Date(b[dateCol.name] as string).getTime());
  }

  return data;
}

/**
 * Utility to test Mock Engine locally without LangGraph
 */
export function __testMockEngine() {
  const schema: SchemaDefinition = {
    tableName: 'synthetic_revenue',
    columns: [
      { name: 'transaction_id', type: 'id' },
      { name: 'purchase_date', type: 'date' },
      { name: 'product_category', type: 'product' },
      { name: 'region', type: 'geo' },
      { name: 'gross_revenue', type: 'currency' },
      { name: 'units_sold', type: 'number' }
    ]
  };
  return generateMockTableData(schema, 50);
}
