import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Gift, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import wheelIcon from "@assets/generated_images/lucky_wheel_centerpiece_icon.png";
import confetti from "@assets/generated_images/success_celebration_graphic.png";

const PRIZES = [50, 100, 500, 1000, 5000, 10000, 50000, 0]; // 0 is empty slot
const COLORS = ["#FCD34D", "#FBBF24", "#F59E0B", "#F97316", "#EF4444", "#EC4899", "#A855F7", "#6B7280"];

export default function LuckyWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showPrize, setShowPrize] = useState(false);
  const [wonAmount, setWonAmount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const userId = localStorage.getItem("userId");

  const { data: canSpin, isLoading } = useQuery({
    queryKey: ["/api/wheel/can-spin", userId],
    enabled: !!userId,
  });

  const spinMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/wheel/spin", { userId });
    },
    onSuccess: (data: any) => {
      const prizeIndex = PRIZES.indexOf(data.prize);
      const targetRotation = rotation + 360 * 5 + (360 / 8) * prizeIndex + (360 / 16);
      
      setIsSpinning(true);
      setRotation(targetRotation);
      
      setTimeout(() => {
        setIsSpinning(false);
        setWonAmount(data.prize);
        setShowPrize(true);
        queryClient.invalidateQueries({ queryKey: ["/api/wheel/can-spin"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        
        if (data.prize > 0) {
          toast({
            title: "تبریک! 🎉",
            description: `شما ${data.prize.toLocaleString("fa-IR")} سوت طلا برنده شدید!`,
          });
        } else {
          toast({
            title: "متاسفیم",
            description: "این بار خانه خالی بود. فردا دوباره امتحان کنید!",
            variant: "destructive",
          });
        }
      }, 4000);
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message || "چرخش گردونه با خطا مواجه شد",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw wheel segments
    const segmentAngle = (2 * Math.PI) / 8;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, i * segmentAngle, (i + 1) * segmentAngle);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = COLORS[i];
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw prize text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(i * segmentAngle + segmentAngle / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Inter";
      ctx.fillText(
        PRIZES[i] === 0 ? "خالی" : PRIZES[i].toLocaleString("fa-IR"),
        radius * 0.7,
        5
      );
      ctx.restore();
    }

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 5;
    ctx.stroke();

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 10);
    ctx.lineTo(centerX - 15, centerY - radius - 30);
    ctx.lineTo(centerX + 15, centerY - radius - 30);
    ctx.closePath();
    ctx.fillStyle = "#EF4444";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, []);

  const handleSpin = () => {
    if (!canSpin?.canSpin) return;
    spinMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto p-6 space-y-6">
      <Card className="border-2" data-testid="card-lucky-wheel">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Gift className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-display font-bold">گردونه شانس</CardTitle>
          <CardDescription className="text-base">
            هر روز یک بار شانس خود را امتحان کنید!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="relative flex items-center justify-center">
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: "easeOut" }}
              className="relative"
            >
              <canvas
                ref={canvasRef}
                width={350}
                height={350}
                className="max-w-full"
                data-testid="canvas-wheel"
              />
            </motion.div>
            
            <img
              src={wheelIcon}
              alt="Wheel Icon"
              className="absolute w-24 h-24 pointer-events-none"
              style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
            />
          </div>

          {canSpin?.canSpin ? (
            <Button
              onClick={handleSpin}
              disabled={isSpinning || spinMutation.isPending}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all animate-pulse"
              size="lg"
              data-testid="button-spin"
            >
              {isSpinning ? (
                <>
                  <Loader2 className="ml-3 h-6 w-6 animate-spin" />
                  در حال چرخش...
                </>
              ) : (
                <>
                  <Sparkles className="ml-3 h-6 w-6" />
                  بچرخان!
                </>
              )}
            </Button>
          ) : (
            <div className="text-center p-6 bg-muted rounded-xl">
              <p className="text-lg font-semibold text-muted-foreground">
                شما امروز گردونه را چرخانده‌اید
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                فردا دوباره برگردید!
              </p>
            </div>
          )}

          {canSpin?.lastSpin && (
            <div className="text-center text-sm text-muted-foreground">
              آخرین چرخش: {new Date(canSpin.lastSpin).toLocaleDateString("fa-IR")}
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {showPrize && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-6"
            onClick={() => setShowPrize(false)}
          >
            <Card className="w-full max-w-md border-4 border-primary shadow-2xl">
              <CardContent className="p-8 text-center space-y-6">
                {wonAmount > 0 && (
                  <img src={confetti} alt="Celebration" className="w-32 h-32 mx-auto" />
                )}
                <h3 className="text-4xl font-display font-bold">
                  {wonAmount > 0 ? "تبریک! 🎉" : "متاسفیم"}
                </h3>
                <p className="text-2xl font-numbers">
                  {wonAmount > 0
                    ? `${wonAmount.toLocaleString("fa-IR")} سوت طلا`
                    : "خانه خالی"}
                </p>
                <Button
                  onClick={() => setShowPrize(false)}
                  className="w-full h-14 text-lg"
                  data-testid="button-close-prize"
                >
                  بستن
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
