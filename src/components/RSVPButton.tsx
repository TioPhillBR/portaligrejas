import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface RSVPButtonProps {
  eventId: string;
}

const RSVPButton = ({ eventId }: RSVPButtonProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: rsvp, isLoading } = useQuery({
    queryKey: ["event-rsvp", eventId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("event_attendees")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("event_attendees").upsert(
        {
          event_id: eventId,
          user_id: user.id,
          status: "confirmed",
        },
        { onConflict: "event_id,user_id" }
      );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-rsvp", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-attendees", eventId] });
      toast.success("Presença confirmada!");
    },
    onError: () => {
      toast.error("Erro ao confirmar presença");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("event_attendees")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-rsvp", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-attendees", eventId] });
      toast.success("Presença cancelada");
    },
    onError: () => {
      toast.error("Erro ao cancelar presença");
    },
  });

  if (!user) {
    return (
      <Link to="/login" className="block">
        <Button className="w-full">
          <UserPlus className="h-4 w-4 mr-2" />
          Fazer login para confirmar presença
        </Button>
      </Link>
    );
  }

  if (isLoading) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Carregando...
      </Button>
    );
  }

  const isConfirmed = rsvp?.status === "confirmed";
  const isPending = confirmMutation.isPending || cancelMutation.isPending;

  return (
    <div className="space-y-2">
      {isConfirmed ? (
        <>
          <Button disabled className="w-full bg-green-600 hover:bg-green-600">
            <Check className="h-4 w-4 mr-2" />
            Presença Confirmada
          </Button>
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={() => cancelMutation.mutate()}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <X className="h-4 w-4 mr-2" />
            )}
            Cancelar Presença
          </Button>
        </>
      ) : (
        <Button
          className="w-full"
          onClick={() => confirmMutation.mutate()}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Confirmar Presença
        </Button>
      )}
    </div>
  );
};

export default RSVPButton;
