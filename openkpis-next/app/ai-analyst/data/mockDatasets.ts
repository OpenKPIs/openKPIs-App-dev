export interface MockDataset {
  id: string;
  name: string;
  description: string;
  data: Record<string, string | number>[];
}

// Generate 30 days of realistic typed mock data
const generateUniversalData = () => {
  const data: Record<string, string | number>[] = [];
  const dimensions = ['Organic Search', 'Direct', 'Paid Social', 'Referral', 'Email'];
  
  let baseInteger = 15000;
  let baseCurrency = 45000.50;
  let basePercentage = 24.5;
  let baseSeconds = 145;

  for (let i = 1; i <= 30; i++) {
    // Add some random walk variation
    baseInteger = Math.max(1000, Math.floor(baseInteger * (1 + (Math.random() * 0.1 - 0.04))));
    baseCurrency = Math.max(1000, parseFloat((baseCurrency * (1 + (Math.random() * 0.12 - 0.05))).toFixed(2)));
    basePercentage = Math.min(99, Math.max(1, parseFloat((basePercentage + (Math.random() * 2 - 1)).toFixed(1))));
    baseSeconds = Math.max(30, Math.floor(baseSeconds + (Math.random() * 20 - 10)));
    
    data.push({
      date: `2024-03-${i.toString().padStart(2, '0')}`,
      value_string: dimensions[i % dimensions.length],
      value_integer: baseInteger,
      value_currency: baseCurrency,
      value_percentage: basePercentage,
      value_time_seconds: baseSeconds,
    });
  }
  return data;
};

export const mockDatasets: MockDataset[] = [
  {
    id: 'universal-mock-dataset',
    name: 'Universal Analytics Dataset',
    description: 'A dynamically typed dataset supporting programmatic AI visualizations across all dimensions and metrics.',
    data: generateUniversalData(),
  }
];
