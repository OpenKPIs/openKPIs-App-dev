export interface MockDataset {
  id: string;
  name: string;
  description: string;
  data: Record<string, string | number>[];
}

export const mockDatasets: MockDataset[] = [
  {
    id: 'b2b-saas-acquisition',
    name: 'B2B SaaS Acquisition (Sample)',
    description: 'Monthly acquisition metrics including traffic, trials, and new MRR.',
    data: [
      { month: '2023-01', visitors: 15200, trials: 850, conversions: 120, mrr: 12000, churn_rate: 2.1 },
      { month: '2023-02', visitors: 16500, trials: 910, conversions: 135, mrr: 13500, churn_rate: 1.9 },
      { month: '2023-03', visitors: 18100, trials: 1050, conversions: 160, mrr: 16000, churn_rate: 1.8 },
      { month: '2023-04', visitors: 17400, trials: 980, conversions: 145, mrr: 14500, churn_rate: 2.4 },
      { month: '2023-05', visitors: 19800, trials: 1120, conversions: 175, mrr: 17500, churn_rate: 1.6 },
      { month: '2023-06', visitors: 22000, trials: 1300, conversions: 210, mrr: 21000, churn_rate: 1.5 },
    ],
  },
  {
    id: 'ecommerce-engagement',
    name: 'E-Commerce Engagement (Sample)',
    description: 'Daily metrics for an e-commerce store tracking funnel dropoff and AOV.',
    data: [
      { date: '2023-03-01', users: 5000, sessions: 6200, cart_adds: 450, purchases: 120, aov: 85.5 },
      { date: '2023-03-02', users: 5200, sessions: 6400, cart_adds: 470, purchases: 130, aov: 82.0 },
      { date: '2023-03-03', users: 4800, sessions: 5900, cart_adds: 410, purchases: 105, aov: 91.0 },
      { date: '2023-03-04', users: 6100, sessions: 7800, cart_adds: 580, purchases: 165, aov: 78.5 },
      { date: '2023-03-05', users: 6500, sessions: 8100, cart_adds: 620, purchases: 180, aov: 80.0 },
      { date: '2023-03-06', users: 5300, sessions: 6700, cart_adds: 490, purchases: 140, aov: 88.0 },
      { date: '2023-03-07', users: 5100, sessions: 6300, cart_adds: 460, purchases: 125, aov: 86.5 },
    ],
  },
];
