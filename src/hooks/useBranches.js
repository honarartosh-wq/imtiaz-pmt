import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook for branch management with React Query
 * Provides caching, automatic refetching, and optimistic updates
 */

// Mock API calls - replace with real API in production
const fetchBranches = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return [
    {
      id: 1,
      name: 'Main Branch',
      code: 'MAIN-001',
      status: 'active',
      clientCount: 15,
      totalBalance: 750000,
      commission: 5.0,
      referralCode: 'MAIN001-REF',
    },
    {
      id: 2,
      name: 'Downtown Branch',
      code: 'DT-002',
      status: 'active',
      clientCount: 20,
      totalBalance: 1200000,
      commission: 5.0,
      referralCode: 'DT002-REF',
    },
    {
      id: 3,
      name: 'West Branch',
      code: 'WEST-003',
      status: 'active',
      clientCount: 10,
      totalBalance: 550000,
      commission: 5.0,
      referralCode: 'WEST003-REF',
    },
  ];
};

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: fetchBranches,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useBranchStats() {
  return useQuery({
    queryKey: ['branchStats'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        totalBranches: 3,
        totalClients: 45,
        totalVolume: 2500000,
        totalCommission: 12500,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
