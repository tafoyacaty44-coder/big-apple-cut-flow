import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { MapPin, Phone } from "lucide-react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { useNextAvailableSlots } from "@/hooks/useNextAvailableSlots";
import { useQuery } from "@tanstack/react-query";
import { getGalleryImages } from "@/lib/api/gallery";
import { TodayAvailability } from "@/components/TodayAvailability";
import { SeoHead } from "@/components/SeoHead";
import { VideoIntro } from "@/components/VideoIntro";
import React from "react";
import fadeOne from '@/assets/gallery/fade-one.jpg';
import fadeTwo from '@/assets/gallery/fade-two.jpg';
import taperOne from '@/assets/gallery/taper-one.jpg';
import taperTwo from '@/assets/gallery/taper-two.jpg';
import taperThree from '@/assets/gallery/taper-three.jpg';
import cleanFadeOne from '@/assets/gallery/clean-fade-one.jpg';
import designOne from '@/assets/gallery/design-one.jpg';
import beardFadeOne from '@/assets/gallery/beard-fade-one.jpg';
import skinFadeOne from '@/assets/gallery/skin-fade-one.jpg';
import classicOne from '@/assets/gallery/classic-one.jpg';
import pompadourOne from '@/assets/gallery/pompadour-one.jpg';


const navItems = [
  { 
    label: "Book your cut", 
    onClick: (navigate: ReturnType<typeof useNavigate>) => navigate('/book'),
    primary: true 
  },
  { 
    label: "Leave a review ⭐", 
    onClick: () => {
      window.open('https://www.google.com/search?client=ms-android-tmus-us-rvc3&sca_esv=f517df8b24517ced&sxsrf=AE3TifMeMUvdrAVRaWcIaKOny_DDKqy3Kg:1763163592413&q=big+apple+barbers+reviews&uds=AOm0WdECvYO7xkHV2F4c7OUn42BkEx8EST3tx-APo32jnw0d4luOWShgqK6Du6AvAed7b_fPeSYBCwwaeDH71s6kdQqH1a9y47WBamHdIEZbLLqbofovuy9XnprjO5ZxdRZpen8KeDxeB48FwctM0yrRSMjPRewW1zGra0bG8IsK3-P0ydUZZUi4rRsX2i1Udm8rBH0sWePtHLlnzIYubP2cQuvG4_eFU4XuOwXoqStAmtN1M98l73a3gqxsD9draiCSmy9vlg39_dIfAFZ5t-TxloqgliQi2pGTaTOzk_4dinG0Iz3Vegqh9w8vzrKOanOyY557ARpJmt6PlRhi4NyP6m4udbQVW08XeF6U3NZMrOVmajU9zQEnat7cTB6aWntACeAdbOXZpR5ebRDbeaaAhohpyzYQvEN3tYfSJQALiYHy-5C2Lx9NvLNKDd_MSz_xIYxZzUo4mbIs_UaXntZZZr91oV5hUJpJK5YdQRcUlvxs4ZyiwZ3s_1_D1u4Zsu7K8KvgDkc1oIEQVp0uK7e6U2yT4iTzADnXfpXQJSdcDt7kPO_lob0&si=AMgyJEvkVjFQtirYNBhM3ZJIRTaSJ6PxY6y1_6WZHGInbzDnMdZ4grdI74XvsyE7W0vToJk4PsGszTWIGUlOX9apgtFlHQ3R_QrlKBBvRmnnFAXrqilUH9YbARDHTYdCbx3CAB5zNOt_JdswmYbrLcePl6y1aunPwQ%3D%3D&sa=X&ved=2ahUKEwjLge2c6PKQAxWKQzABHRDJJssQk8gLegQIPBAB&ictx=1&biw=360&bih=676&dpr=3#ebo=1', '_blank');
    },
    external: true
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
    label: "Cuts & styles gallery", 
    onClick: (navigate: ReturnType<typeof useNavigate>) => navigate('/gallery')
  },
];

interface CTAButtonProps {
  label: string;
  onClick: () => void;
  primary?: boolean;
  external?: boolean;
}

function CTAButton({ label, onClick, primary, external }: CTAButtonProps) {
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
      className={`group relative w-full rounded-xl px-6 py-4 text-center font-semibold tracking-wide shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-2 focus:ring-offset-primary select-none bg-accent text-accent-foreground hover:bg-accent/90 ${external ? 'border-2 border-accent/30' : ''}`}
      whileHover={{ scale: 1.035, boxShadow: "0 0 18px hsl(var(--accent) / 0.45)" }}
      whileTap={{ scale: 0.985 }}
      animate={primary && !reduce ? { x: mx, y: my } : undefined}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      {/* Sheen sweep */}
      <span className="pointer-events-none absolute inset-y-0 -left-1 w-1/3 -translate-x-[130%] bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-12 transition-transform duration-500 group-hover:translate-x-[310%]" />
      {label}
      {external && <span className="ml-1 text-xs opacity-70">↗</span>}
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

// Fallback gallery images
const fallbackImages = [
  { id: '1', image_url: fadeOne, category: 'Fades', title: 'High Fade with Hard Part' },
  { id: '2', image_url: fadeTwo, category: 'Fades', title: 'Skin Fade with Design' },
  { id: '3', image_url: taperOne, category: 'Tapers', title: 'Classic Taper' },
  { id: '4', image_url: taperTwo, category: 'Tapers', title: 'Mid Taper Fade' },
  { id: '5', image_url: taperThree, category: 'Tapers', title: 'Low Taper with Beard' },
  { id: '6', image_url: cleanFadeOne, category: 'Fades', title: 'Clean Fade' },
  { id: '7', image_url: designOne, category: 'Designs', title: 'Hair Design Art' },
  { id: '8', image_url: beardFadeOne, category: 'Beard Work', title: 'Beard Fade Blend' },
  { id: '9', image_url: skinFadeOne, category: 'Fades', title: 'Bald Fade' },
  { id: '10', image_url: classicOne, category: 'Classic Cuts', title: 'Traditional Side Part' },
  { id: '11', image_url: pompadourOne, category: 'Pompadours', title: 'Modern Pompadour' },
];

function GalleryRow() {
  const reduce = useReducedMotion();
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState(0);
  const [active, setActive] = React.useState<string | null>(null);

  const { data: dbImages } = useQuery({
    queryKey: ['landing-gallery'],
    queryFn: () => getGalleryImages(),
  });

  // Use database images if available, otherwise use fallback
  const images = dbImages && dbImages.length > 0 ? dbImages : fallbackImages;

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

  return (
    <section id="gallery" className="relative w-full px-0 pt-8 pb-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="mb-6 text-3xl md:text-4xl font-bold tracking-tight text-primary-foreground text-center">
            Cuts & Styles
          </h2>
      </div>

      <motion.div className="overflow-hidden">
        <motion.div
          ref={trackRef}
          className="flex gap-4 px-4 sm:px-6 cursor-grab active:cursor-grabbing"
          drag={reduce ? false : "x"}
          dragConstraints={{ left: -width, right: 0 }}
          dragElastic={0.04}
          dragMomentum={true}
        >
          {images.map((image) => (
            <motion.button
              key={image.id}
              className="relative aspect-[3/4] w-[75vw] sm:w-[45vw] md:w-[30vw] lg:w-[23vw] xl:w-[18vw] overflow-hidden rounded-xl bg-background/5 border border-border hover:border-accent transition-colors flex-shrink-0"
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActive(image.image_url)}
            >
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted/20 to-transparent" />
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
                <div className="absolute bottom-3 left-3 right-3">
                  {image.title && (
                    <p className="text-white font-semibold text-sm mb-1">{image.title}</p>
                  )}
                  <span className="inline-block px-2 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded">
                    {image.category}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {!reduce && (
        <p className="mt-4 px-4 text-center text-sm text-muted-foreground">
          Swipe left to browse • Tap to enlarge
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
    <>
      <VideoIntro />
      <main className="min-h-[100dvh] bg-primary text-primary-foreground relative overflow-hidden">
        <SeoHead pageSlug="home" />
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
      <section className="relative z-10 flex flex-col items-center justify-center gap-8 px-4 py-12 pt-24">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 1.4, 
            ease: [0.16, 1, 0.3, 1],
            opacity: { duration: 1.2 },
            scale: { duration: 1.4 }
          }}
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
              external={navItem.external}
            />
          ))}
        </motion.div>

        {/* Contact Information Footer */}
        <motion.div
          className="py-8 px-4 text-center space-y-6"
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

          {/* Google Maps Embed */}
          <div className="mt-6 max-w-2xl mx-auto">
            <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-accent/20">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.025!2d-73.98685!3d40.730824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2599e8b4c5c5b%3A0x1234567890abcdef!2s422%20E%2014th%20St%2C%20New%20York%2C%20NY%2010009!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="320"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Big Apple Barbers Location - 422 E 14th St, New York"
                className="w-full"
              />
            </div>
            <a 
              href="https://maps.google.com/?q=422+E+14th+St,+New+York,+NY+10009" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-accent hover:text-accent/80 transition-colors font-medium text-sm"
            >
              <MapPin className="h-4 w-4" />
              Open in Google Maps →
            </a>
          </div>
        </motion.div>
      </section>

      {/* Gallery Section */}
      <div className="relative z-10 pt-6">
        <GalleryRow />
      </div>

      {/* Today's Availability - Hidden for now */}
      {/* <div className="relative z-10 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary-foreground text-center">
            Live Availability
          </h2>
          <p className="text-center text-primary-foreground/70 mt-2">
            Book your appointment today
          </p>
        </div>
        <TodayAvailability />
      </div> */}
      </main>
    </>
  );
};

export default Index;
