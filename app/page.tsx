import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Users,
  Leaf,
  Trophy,
  CheckCircle2,
  Globe2,
  Target,
  Sparkles,
} from "lucide-react";

const modules = [
  {
    title: "EduImpact",
    subtitle: "Student Development",
    description:
      "Learn SDGs, participate in challenges, build skills and transform learning into measurable action.",
    href: "/student",
    icon: BookOpen,
    number: "01",
  },
  {
    title: "CivicConnect",
    subtitle: "Community Development",
    description:
      "Connect people with local initiatives, report community issues and collaborate on meaningful solutions.",
    href: "/community",
    icon: Users,
    number: "02",
  },
  {
    title: "EcoGuard",
    subtitle: "Environment & Life",
    description:
      "Support biodiversity, tree plantation, waste reduction and environmental conservation activities.",
    href: "/earth",
    icon: Leaf,
    number: "03",
  },
];

const workflow = [
  "Learn SDGs",
  "Join Challenge",
  "Create Activity",
  "Submit Evidence",
  "Admin Review",
  "Impact Calculated",
  "Points + Badge",
  "Certificate",
];

const stats = [
  { value: "17", label: "SDGs covered" },
  { value: "7", label: "Core SDGs mapped" },
  { value: "100+", label: "Potential activities" },
  { value: "∞", label: "Impact possibilities" },
];

export default function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-[#f4f9f5]">
        <div className="hero-glow left-[-100px] top-[-120px]" />
        <div className="hero-glow bottom-[-150px] right-[-100px]" />
        <div className="hero-grid absolute inset-0 opacity-40" />

        <div className="page-container relative py-20 md:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_.85fr]">
            <div className="fade-up">
              <div className="section-label mb-6">
                <Sparkles size={14} />
                SDG ACTION PLATFORM
              </div>

              <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-[#102b1e] md:text-7xl">
                Students.
                <br />
                Society.
                <br />
                <span className="gradient-text">Earth.</span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#64746b] md:text-xl">
                <strong className="text-[#0f5132]">SustainX</strong>{" "}
                transforms SDG learning into real-world action. Learn,
                collaborate, create activities, measure impact and build a
                stronger future.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/sdgs" className="btn-primary">
                  Explore SDGs
                  <ArrowRight size={17} />
                </Link>

                <Link href="/challenges" className="btn-secondary">
                  Join a Challenge
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#68776f]">
                {["Learn", "Act", "Connect", "Measure"].map((item) => (
                  <span key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#3e8b4e]" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="fade-up delay-2">
              <div className="relative mx-auto max-w-[500px]">
                <div className="absolute inset-8 rounded-full bg-[#a8d5b1] opacity-30 blur-3xl" />

                <div className="relative rounded-[30px] border border-[#cfe2d4] bg-white p-5 shadow-2xl shadow-[#0f5132]/10">
                  <div className="rounded-[22px] bg-[#0b4129] p-6 text-white">
                    <div className="mb-8 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#a9cbb5]">
                          SUSTAINX
                        </p>
                        <h2 className="mt-2 text-2xl font-black">
                          Impact starts with action.
                        </h2>
                      </div>
                      <Globe2 size={35} className="text-[#84c58d]" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["17", "SDGs"],
                        ["03", "Modules"],
                        ["∞", "Actions"],
                        ["01", "Mission"],
                      ].map(([value, label]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-white/10 bg-white/10 p-4"
                        >
                          <div className="text-2xl font-black">{value}</div>
                          <div className="mt-1 text-xs text-[#b4d1bd]">
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl bg-[#75b97c] p-4">
                      <div className="flex items-center gap-3">
                        <Trophy size={22} />
                        <div>
                          <p className="text-sm font-extrabold">
                            Create measurable impact
                          </p>
                          <p className="text-xs text-white/80">
                            Every verified action counts.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#dce7df] bg-white">
        <div className="page-container grid grid-cols-2 divide-x divide-[#e3ebe5] md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="px-5 py-8 text-center">
              <div className="stat-number">{stat.value}</div>
              <div className="mt-2 text-xs font-bold uppercase tracking-wider text-[#7b8981]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section bg-[#f7faf7]">
        <div className="page-container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <div className="section-label">
              <Target size={14} />
              ONE PLATFORM • THREE DIRECTIONS
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-[#163526] md:text-5xl">
              Turn knowledge into impact.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#6b7a71]">
              SustainX connects student development, community action and
              environmental responsibility inside one platform.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  href={module.href}
                  key={module.title}
                  className="sustain-card sustain-card-hover group p-7"
                >
                  <div className="mb-7 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e5f4e9] text-[#0f5132]">
                      <Icon size={25} />
                    </div>
                    <span className="text-sm font-black text-[#b0bdb5]">
                      {module.number}
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#779085]">
                    {module.subtitle}
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-[#173526]">
                    {module.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[#6c7972]">
                    {module.description}
                  </p>
                  <div className="mt-7 flex items-center gap-2 text-sm font-bold text-[#0f5132]">
                    Explore module
                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section bg-[#0b4129] text-white">
        <div className="page-container">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-[#b7d6c1]">
                <Target size={14} />
                SUSTAINX IMPACT ENGINE
              </div>
              <h2 className="mt-6 text-4xl font-black tracking-tight md:text-5xl">
                From learning
                <br />
                to real impact.
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-[#b8d0c0]">
                Every action follows a transparent workflow so activities can
                be submitted, verified and converted into measurable impact.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {workflow.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6eaf75] text-sm font-black">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <span className="text-sm font-bold text-[#e4f1e8]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="page-container">
          <div className="overflow-hidden rounded-[28px] bg-[#e9f6ec] p-8 md:p-12">
            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-[#0f5132]">
                  <Leaf size={17} />
                  YOUR ACTION MATTERS
                </div>
                <h2 className="mt-3 text-3xl font-black text-[#153426] md:text-4xl">
                  Start your SustainX journey today.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#63736a]">
                  Learn about the SDGs, discover challenges, create projects
                  and turn your actions into measurable impact.
                </p>
              </div>
              <Link href="/login" className="btn-primary">
                Get Started
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
