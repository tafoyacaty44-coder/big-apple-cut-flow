import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { MapPin, Phone } from "lucide-react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { useNextAvailableSlots } from "@/hooks/useNextAvailableSlots";
import React from "react";

const navItems = [
  { 
    label: "Book your cut", 
    onClick: (navigate: ReturnType<typeof useNavigate>) => navigate('/book'),
    primary: true 
  },
  { 
    label: "Our Services", 
    onClick: (navigate: ReturnType<typeof useNavigate>) => {
      const servicesSection = document.getElementById('services');
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/book');
      }
    }
  },
  { 
    label: "Login & Reschedule", 
    onClick: (navigate: ReturnType<typeof useNavigate>) => navigate('/login')
  },
  { 
    label: "Meet the barbers", 
    onClick: (navigate: ReturnType<typeof useNavigate>) => navigate('/barbers')
  },
  { 
    label: "Contact Us", 
    onClick: (navigate: ReturnType<typeof useNavigate>) => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  },
  { 
    label: "Cuts & styles gallery", 
    onClick: (navigate: ReturnType<typeof useNavigate>) => navigate('/gallery')
  },
];

interface CTAButtonProps {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

function CTAButton({ label, onClick, primary }: CTAButtonProps) {
  const reduce = useReducedMotion();
  const [mx, setMx] = React.useState(0);
  const [my, setMy] = React.useState(0);

  const magnetic = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reduce || !primary) return;
    const r = e.currentTarget.getBoundingClientRect();
    setMx(((e.clientX - r.left) - r.width / 2) / 18);
    setMy(((e.clientY - r.top) - r.height / 2) / 18);
  };

  const resetMagnetic = () => { setMx(0); setMy(0); };

  return (
    <motion.button
      variants={item}
      onClick={onClick}
      onMouseMove={magnetic}
      onMouseLeave={resetMagnetic}
      className="group relative w-full rounded-xl px-6 py-4 text-center font-semibold tracking-wide shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-2 focus:ring-offset-primary select-none bg-accent text-accent-foreground hover:bg-accent/90"
      whileHover={{ scale: 1.035, boxShadow: "0 0 18px hsl(var(--accent) / 0.45)" }}
      whileTap={{ scale: 0.985 }}
      animate={primary && !reduce ? { x: mx, y: my } : undefined}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      {/* Sheen sweep */}
      <span className="pointer-events-none absolute inset-y-0 -left-1 w-1/3 -translate-x-[130%] bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-12 transition-transform duration-500 group-hover:translate-x-[310%]" />
      {label}
    </motion.button>
  );
}

const container: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.15, when: "beforeChildren" as const },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const Index = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { data: slots } = useNextAvailableSlots(3);

  return (
    <main className="min-h-[100dvh] bg-primary text-primary-foreground relative overflow-hidden">
      {/* Animated gradient background */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(270deg, hsl(var(--primary)), hsl(var(--primary)/0.95), hsl(var(--primary)))",
          backgroundSize: "400% 400%",
        }}
        animate={reduce ? undefined : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      {/* Vignette overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_20%,rgba(217,168,45,0.07),transparent_60%),radial-gradient(60%_40%_at_50%_100%,rgba(0,0,0,0.75),rgba(0,0,0,0.95))]" />
      
      {/* Subtle noise texture */}
      <div className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-[0.06]" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\" opacity=\"0.25\"/></svg>')" }} />

      {/* Content */}
      <section className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center gap-8 px-4 py-16">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -18, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          <Logo size="lg" className="opacity-95 drop-shadow-[0_2px_10px_rgba(217,168,45,0.15)]" />
        </motion.div>

        {/* Credibility bar */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
          className="text-sm text-primary-foreground/80"
          aria-label="rating"
        >
          <span className="mr-1">⭐</span> 4.8 (<span className="tabular-nums">356</span> Google reviews) • East Village • Walk-ins welcome
        </motion.p>

        {/* Navigation Buttons */}
        <motion.div
          className="w-full max-w-[720px] flex flex-col gap-4"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {navItems.map((navItem, idx) => (
            <div key={navItem.label} className="flex flex-col items-center gap-2">
              <CTAButton 
                label={navItem.label} 
                onClick={() => navItem.onClick(navigate)}
                primary={idx === 0 && navItem.primary}
              />
              {/* Live availability teaser under primary CTA only */}
              {idx === 0 && slots && slots.length > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="text-xs text-primary-foreground/70"
                >
                  Next openings: {slots.join(" • ")}
                </motion.p>
              )}
            </div>
          ))}
        </motion.div>

        {/* Contact Information Footer */}
        <motion.div
          className="py-8 px-4 text-center space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-2 text-accent text-xl font-semibold mb-2">
            <Phone className="h-5 w-5" />
            <a href="tel:2126514858" className="hover:text-accent/80 transition-colors">
              212-651-4858
            </a>
          </div>
          <div className="text-primary-foreground/90 space-y-1">
            <div className="text-lg font-medium">422 East 14 Street</div>
            <div className="flex items-center justify-center gap-2 text-lg">
              <MapPin className="h-4 w-4" />
              <span>New York, NY 10009</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Sticky phone CTA */}
      <motion.a
        href="tel:2126514858"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-accent px-5 py-3 text-accent-foreground font-semibold shadow-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent/60 z-50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="mr-1">📞</span> 212-651-4858
      </motion.a>
    </main>
  );
};

export default Index;
