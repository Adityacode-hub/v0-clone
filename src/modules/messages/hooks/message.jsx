import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createMessages, getMessages } from "../actions";


export const prefetchMessages = async (queryClient, projectId) => {
  if (!projectId) return; // ✅ guard
  await queryClient.prefetchQuery({
    queryKey: ["messages", projectId],
    queryFn: () => getMessages(projectId),
    staleTime: 10000, 
  });
};

export const useGetMessages = (projectId) => {
  return useQuery({
    queryKey: ["messages", projectId], 
    queryFn: () => getMessages(projectId),
    enabled: !!projectId,  // ✅ only runs when projectId exists
    staleTime: 10000,
    refetchInterval: (query) => {
      const data = query.state.data;
      const last = data?.[data.length - 1];
      // ✅ keep polling if last message is from user (still processing)
      return last?.role === "USER" ? 3000 : false;
    },
  });
};

export const useCreateMessages = (projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value) => createMessages(value, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["messages", projectId] 
      });
      queryClient.invalidateQueries({
        queryKey: ["status"],
      });
    },
  });
};