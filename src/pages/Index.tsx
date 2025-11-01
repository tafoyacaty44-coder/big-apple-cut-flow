import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { MapPin, Phone } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const navItems = [
  { 
    label: "Book an Appointment", 
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
    label: "Meet our Stylist", 
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
    label: "Gallery & Styles", 
    onClick: (navigate: ReturnType<typeof useNavigate>) => navigate('/gallery')
  },
];

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
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      {/* Vignette overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_20%,rgba(217,168,45,0.07),transparent_60%),radial-gradient(60%_40%_at_50%_100%,rgba(0,0,0,0.75),rgba(0,0,0,0.95))]" />

      {/* Content */}
      <section className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center gap-10 px-4 py-16">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -18, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          <Logo size="lg" className="opacity-95 drop-shadow-[0_2px_10px_rgba(217,168,45,0.15)]" />
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          className="w-full max-w-[720px] flex flex-col gap-4"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {navItems.map((navItem, idx) => (
            <motion.button
              key={navItem.label}
              variants={item}
              onClick={() => navItem.onClick(navigate)}
              className="w-full rounded-xl px-6 py-4 text-center font-semibold tracking-wide shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-2 focus:ring-offset-primary select-none bg-accent text-accent-foreground hover:bg-accent/90"
              whileHover={{ scale: 1.035, boxShadow: "0 0 18px hsl(var(--accent) / 0.45)" }}
              whileTap={{ scale: 0.985 }}
              animate={
                navItem.primary
                  ? {
                      scale: [1, 1.02, 1],
                      boxShadow: [
                        "0 0 0 hsl(var(--accent) / 0)",
                        "0 0 26px hsl(var(--accent) / 0.55)",
                        "0 0 0 hsl(var(--accent) / 0)",
                      ],
                    }
                  : undefined
              }
              transition={navItem.primary ? { duration: 1.6, repeat: Infinity, repeatDelay: 8 } : undefined}
            >
              {navItem.label}
            </motion.button>
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
