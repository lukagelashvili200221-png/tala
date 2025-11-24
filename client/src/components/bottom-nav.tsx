import { Link, useLocation } from "wouter";
import { Home, Wallet, Gift, ArrowDownUp, User } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", icon: Home, label: "خانه", testId: "nav-home" },
  { path: "/wallet", icon: Wallet, label: "کیف پول", testId: "nav-wallet" },
  { path: "/lucky-wheel", icon: Gift, label: "گردونه", testId: "nav-wheel" },
  { path: "/trading", icon: ArrowDownUp, label: "معامله", testId: "nav-trading" },
  { path: "/profile", icon: User, label: "پروفایل", testId: "nav-profile" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t-2 border-border z-50 safe-area-bottom" data-testid="bottom-nav">
      <div className="container max-w-2xl mx-auto">
        <div className="flex items-center justify-around h-20">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <a
                  className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl hover-elevate active-elevate-2 relative"
                  data-testid={item.testId}
                >
                  <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary/10 rounded-full -m-2"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon
                      className={`w-6 h-6 relative z-10 ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
