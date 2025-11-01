import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { MapPin, Phone } from "lucide-react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { useNextAvailableSlots } from "@/hooks/useNextAvailableSlots";
import { useQuery } from "@tanstack/react-query";
import { getGalleryImages } from "@/lib/api/gallery";
import { TodayAvailability } from "@/components/TodayAvailability";
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

function Lightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  const reduce = useReducedMotion();

  React.useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => { 
      if (e.key === "Escape") onClose(); 
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { 
      window.removeEventListener("keydown", onKey); 
      document.body.style.overflow = ""; 
    };
  }, [src, onClose]);

  if (!src) return null;
  
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.img
        onClick={(e) => e.stopPropagation()}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        src={src}
        alt="Style preview"
        className="max-h-[85vh] max-w-[92vw] rounded-2xl shadow-2xl"
      />
      <button
        aria-label="Close"
        className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 text-white px-3 py-1"
        onClick={onClose}
      >
        ✕
      </button>
    </motion.div>
  );
}

function GalleryRow() {
  const reduce = useReducedMotion();
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState(0);
  const [active, setActive] = React.useState<string | null>(null);

  const { data: images = [] } = useQuery({
    queryKey: ['landing-gallery'],
    queryFn: () => getGalleryImages(),
  });

  React.useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      setWidth(el.scrollWidth - el.clientWidth);
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [images]);

  if (images.length === 0) return null;

  return (
    <section id="gallery" className="relative w-full px-0 pt-8 pb-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-4 text-lg font-semibold tracking-wide text-primary-foreground/90">
          Cuts & styles
        </h2>
      </div>

      <motion.div className="overflow-hidden">
        <motion.div
          ref={trackRef}
          className="flex gap-3 px-4"
          drag={reduce ? false : "x"}
          dragConstraints={{ left: -width, right: 0 }}
          dragElastic={0.04}
          dragMomentum={true}
        >
          {images.map((image) => (
            <motion.button
              key={image.id}
              className="relative aspect-[4/5] w-[68vw] sm:w-[36vw] md:w-[28vw] lg:w-[22vw] overflow-hidden rounded-2xl bg-white/5"
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActive(image.image_url)}
            >
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 to-white/0" />
              <img
                src={image.image_url}
                loading="lazy"
                alt={image.title || `${image.category} style`}
                className="h-full w-full object-cover"
                onLoad={(e) => 
                  (e.currentTarget.previousElementSibling as HTMLElement)
                    ?.classList.add("hidden")
                }
              />
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {!reduce && (
        <p className="mt-3 px-4 text-center text-xs text-primary-foreground/60">
          Drag to browse • Tap to enlarge
        </p>
      )}

      <Lightbox src={active} onClose={() => setActive(null)} />
    </section>
  );
}

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
          <span className="mr-1">⭐</span> 4.8 (<span className="tabular-nums">356</span> Google reviews) • East Village
        </motion.p>

        {/* Live Availability Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-2"
        >
          <p className="text-xs text-primary-foreground/60 uppercase tracking-wider">
            {slots && slots.length > 0 ? "Next available" : "Walk-ins welcome"}
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            {slots && slots.length > 0 ? (
              slots.slice(0, 3).map((slot, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium"
                >
                  {slot}
                </span>
              ))
            ) : (
              <span className="px-3 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium">
                Call for times
              </span>
            )}
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          className="w-full max-w-[720px] flex flex-col gap-4"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {navItems.map((navItem) => (
            <CTAButton 
              key={navItem.label}
              label={navItem.label} 
              onClick={() => navItem.onClick(navigate)}
              primary={navItem.primary}
            />
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

      {/* Today's Availability */}
      <div className="relative z-10 py-12">
        <TodayAvailability />
      </div>

      {/* Gallery Section */}
      <div className="relative z-10">
        <GalleryRow />
      </div>
    </main>
  );
};

export default Index;
