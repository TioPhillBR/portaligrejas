import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  X,
  Rocket,
  PartyPopper,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSetupChecklist } from "@/hooks/useSetupChecklist";
import { cn } from "@/lib/utils";

export default function SetupChecklist() {
  const {
    items,
    loading,
    isDismissed,
    completedCount,
    totalCount,
    progress,
    isAllCompleted,
    dismissChecklist,
  } = useSetupChecklist();

  // Don't show if dismissed or all completed
  if (isDismissed || isAllCompleted || loading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Configure sua Igreja</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Complete estas tarefas para começar
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 -mt-1 -mr-2"
              onClick={dismissChecklist}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium text-foreground">
                {completedCount} de {totalCount} concluídas
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-1">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                    item.isCompleted
                      ? "bg-muted/30 hover:bg-muted/50"
                      : "bg-card hover:bg-muted/50 border border-border"
                  )}
                >
                  {item.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "font-medium text-sm",
                        item.isCompleted && "text-muted-foreground line-through"
                      )}
                    >
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                  {!item.isCompleted && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Celebration when close to complete */}
          {completedCount === totalCount - 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3"
            >
              <PartyPopper className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Falta só mais uma tarefa! Você está quase lá!
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
