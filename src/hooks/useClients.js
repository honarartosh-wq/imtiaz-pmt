import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook for client management with React Query
 */

const fetchClients = async () => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  
  return [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      account: 'ACC-10001',
      balance: 50000,
      equity: 52500,
      freeMargin: 47500,
      marginLevel: 1050,
      usedMargin: 5000,
      status: 'active',
      accountType: 'standard',
      openPositions: 3,
      totalProfit: 2500,
      todayTrades: 5,
      lastActive: '2024-11-19 14:30',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      account: 'ACC-10002',
      balance: 75000,
      equity: 76850,
      freeMargin: 68350,
      marginLevel: 902,
      usedMargin: 8500,
      status: 'active',
      accountType: 'business',
      openPositions: 5,
      totalProfit: 1850,
      todayTrades: 12,
      lastActive: '2024-11-19 15:45',
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike@example.com',
      account: 'ACC-10003',
      balance: 30000,
      equity: 29500,
      freeMargin: 28000,
      marginLevel: 1967,
      usedMargin: 1500,
      status: 'active',
      accountType: 'standard',
      openPositions: 1,
      totalProfit: -500,
      todayTrades: 2,
      lastActive: '2024-11-19 12:15',
    },
  ];
};

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
    staleTime: 60 * 1000, // 1 minute
  });
}
