import { motion } from "framer-motion";
import { ArrowDown, Quote, Radio, Satellite, Sparkles, Droplets } from "lucide-react";
import { useRealTimeData } from "../hooks/useRealTimeData";
import { useStpRealTimeData } from "../hooks/useStpRealTimeData";

// Real river basins with historical info
const sacredBasins = [
  {
    id: "devprayag",
    river: "Ganga",
    station: "Devprayag Confluence",
    state: "Uttarakhand",
    image: "/sacred_rivers/image3.jpg",
    history: "Devprayag marks the confluence of the Alaknanda and Bhagirathi rivers, where the River Ganga officially originates. Historically revered as a major pilgrimage center in the Himalayas, it is home to the ancient Raghunathji Temple, a shrine that has attracted devotees and scholars for centuries due to its religious and cultural significance."
  },
  {
    id: "hooghly",
    river: "Hooghly",
    station: "Colonial Gateway Reach",
    state: "West Bengal",
    image: "/sacred_rivers/image5.jpg",
    history: "The Hooghly River played a crucial role in shaping the colonial history of India by serving as the principal commercial gateway to eastern India. Its banks hosted major trading settlements established by the British, French, Dutch, and Portuguese, making the river a focal point of maritime trade and European expansion in the Indian subcontinent."
  },
  {
    id: "ganga-ghats",
    river: "Ganga",
    station: "Ganga Ghats Stretch",
    state: "Uttar Pradesh",
    image: "/sacred_rivers/image6.jpg",
    history: "The Ganga Ghats of Varanasi comprise more than eighty riverfront structures extending along a crescent-shaped stretch of the Ganges. Although Varanasi is among the world's oldest continuously inhabited cities, much of the present-day ghat architecture was constructed during the eighteenth century under the patronage of prominent Maratha rulers."
  },
  {
    id: "dashashwamedh",
    river: "Ganga",
    station: "Dashashwamedh Ghat",
    state: "Uttar Pradesh",
    image: "/sacred_rivers/image1.jpg",
    history: "Dashashwamedh Ghat is the most prominent and historically significant ghat in Varanasi. The present stone embankment was developed in the eighteenth century under the patronage of Peshwa Balaji Baji Rao and later enhanced by Queen Ahilyabai Holkar, contributing to its status as a major center of religious and cultural activity."
  },
  {
    id: "sarayu",
    river: "Sarayu",
    station: "Ayodhya Temple Reach",
    state: "Uttar Pradesh",
    image: "/sacred_rivers/image2.jpg",
    history: "The Sarayu River served as a vital geostrategic and commercial artery for the ancient Kosala Kingdom, anchoring protohistoric human settlements like Nahush-ka-tila and Khairadih that date back to 1000 BCE. During the Mahajanapada era, the river functioned as a critical inland waterway linking urban centers directly to the Uttarapatha trans-continental trade highway for the transport of timber, iron, and textiles. Epigraphical records, including the first-century BCE Ayodhya Inscription of Dhana and Gupta-era copper plates, document the river basin as a fortified military frontier and a highly organized administrative revenue zone known as Sarayupara."
  },
  {
    id: "kaveri",
    river: "Kaveri",
    station: "Talakaveri / Delta Reach",
    state: "Karnataka",
    image: "/sacred_rivers/image4.jpg",
    history: "The Kaveri River is one of the most historically significant rivers of South India, originating at Talakaveri in the Brahmagiri Hills of Kodagu, Karnataka. It formed the backbone of ancient South Indian civilizations, especially during the Chola dynasty, which developed advanced irrigation systems along its fertile delta. One of the earliest engineering marvels, the Grand Anicut (Kallanai Dam), was constructed across the river by King Karikala Chola around the 2nd century CE and remains in use even today."
  }
];

export default function HomePage() {
  const { stations: cpcbStations } = useRealTimeData(60000);
  const { stations: stpStations } = useStpRealTimeData(60000);
  const liveCount = (cpcbStations.length && stpStations.length) ? (cpcbStations.length + stpStations.length) : 114;

  return (
    <div>
      {/* HERO SECTION */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
        {/* HTML5 video tag using the custom video file */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Video Overlay with Deep Blue Gradient matching lovable palette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B3C5D]/70 via-[#0B3C5D]/40 to-[#0B3C5D]/95" />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-20 pt-32 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs backdrop-blur"
          >
            <Satellite className="h-3 w-3 text-[var(--aqua)]" />
            Real-time IoT telemetry · {liveCount} stations live
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="mt-5 max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
          >
            <span className="text-white">River</span><span className="text-[var(--aqua)]">Pulse</span><span className="text-white">India</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="mt-4 max-w-2xl text-base text-white/80 md:text-lg"
          >
            A national pulse for India's rivers — synchronizing IoT sensor telemetry,
            satellite imagery and citizen reporting across every basin from the Ganga
            to the Brahmaputra, the Kaveri to the Indus.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-wrap gap-3 text-xs"
          >
            <Pill icon={<Radio className="h-3 w-3" />} label="Live signal · 5 min refresh" />
            <Pill icon={<Sparkles className="h-3 w-3" />} label="29 States & UTs" />
            <Pill icon={<Satellite className="h-3 w-3" />} label="Satellite-linked basins" />
          </motion.div>

          <div className="mt-12 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
            <ArrowDown className="h-3 w-3 animate-bounce" /> Scroll to explore
          </div>
        </div>
      </section>

      {/* SACRED RIVER BASINS GALLERY */}
      <section className="bg-[var(--slate-soft)] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--aqua)]">Sacred Waterways</p>
            <h2 className="mt-2 text-3xl font-bold text-[var(--river)] md:text-4xl">River Basins & Heritage</h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              A glimpse into the spiritual and historical roots of our river basins — now monitored under live technological telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sacredBasins.map((b, i) => (
              <motion.article
                key={b.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-[var(--shadow-card)] ring-1 ring-black/5"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={b.image}
                    alt={`${b.river} at ${b.station}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute right-3 top-3 rounded-full bg-[var(--aqua)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                    {b.river}
                  </span>
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="text-[11px] uppercase tracking-widest text-white/70">{b.state}</div>
                    <div className="text-lg font-semibold leading-tight">{b.station}</div>
                  </div>
                </div>
                <div className="flex-1 p-5 text-sm text-muted-foreground leading-relaxed flex flex-col justify-between">
                  <p className="mb-4">{b.history}</p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-[var(--river)] uppercase tracking-wider">
                    <Droplets className="h-3 w-3 text-[var(--aqua)]" /> {b.river} Telemetry Active
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* SDG 6 AND QUOTES */}
      <section className="relative overflow-hidden bg-[var(--river)] py-28 text-white">
        <div className="absolute inset-0 opacity-20" style={{
          background: "radial-gradient(800px 400px at 20% 30%, #328CC1 0%, transparent 60%), radial-gradient(600px 300px at 80% 70%, #328CC1 0%, transparent 60%)",
        }} />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--aqua)] text-2xl font-bold text-white">06</div>
            <h3 className="mt-5 text-3xl font-bold leading-tight md:text-4xl text-white">
              Clean Water & Sanitation
            </h3>
            <p className="mt-3 text-white/70">
              Aligned with the United Nations Sustainable Development Goal 6 — ensuring availability
              and sustainable management of water and sanitation for all.
            </p>
          </div>
          <div className="space-y-6 md:col-span-3">
            {[
              "We do not inherit rivers from our ancestors — we borrow them from our children.",
              "A drop of clean water is a vote cast for the next generation.",
              "The pulse of a nation is measured in the health of its rivers.",
            ].map((q, i) => (
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="relative rounded-lg border border-white/10 bg-white/5 p-5 pl-12 backdrop-blur"
              >
                <Quote className="absolute left-4 top-5 h-5 w-5 text-[var(--aqua)]" />
                <p className="text-lg leading-relaxed text-white">{q}</p>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 backdrop-blur text-white">
      {icon} {label}
    </span>
  );
}
