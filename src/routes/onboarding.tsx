import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, GraduationCap, Rocket, ArrowRight } from "lucide-react";
import { storage } from "@/lib/storage";
import { GradientButton } from "@/components/FeatureShell";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to CodeMate AI" },
      {
        name: "description",
        content: "Get started with CodeMate AI — generate code, learn faster and build projects with AI.",
      },
    ],
  }),
  component: Onboarding,
});

const slides = [
  {
    title: "Generate Code Instantly",
    description:
      "Generate high-quality code in multiple programming languages with AI, complete with explanations.",
    icon: Sparkles,
    gradient: "gradient-blue",
  },
  {
    title: "Learn Faster",
    description:
      "Generate notes, solve coding challenges and prepare for interviews from any device.",
    icon: GraduationCap,
    gradient: "gradient-purple",
  },
  {
    title: "Build Projects",
    description:
      "Generate complete mini projects with documentation, folder structure and source code.",
    icon: Rocket,
    gradient: "gradient-green",
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const s = slides[i];
  const Icon = s.icon;
  const last = i === slides.length - 1;

  const finish = () => {
    storage.setOnboarded();
    navigate({ to: "/app" });
  };

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-between px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
        <Logo className="scale-95" />
        <button onClick={finish} className="text-sm font-medium text-subtitle">
          Skip
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
        <div
          key={i}
          className={`${s.gradient} grid h-56 w-56 animate-in fade-in zoom-in-95 duration-500 place-items-center rounded-[3rem] shadow-lift`}
        >
          <Icon className="h-24 w-24 text-white" strokeWidth={1.5} />
        </div>

        <h2 className="mt-10 text-center text-2xl font-bold text-foreground">{s.title}</h2>
        <p className="mt-3 max-w-sm text-center text-sm leading-relaxed text-subtitle">
          {s.description}
        </p>
      </div>

      <div className="px-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <div className="mb-6 flex justify-center gap-2">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === i ? "w-8 gradient-blue" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>
        <GradientButton
          onClick={() => (last ? finish() : setI(i + 1))}
          gradient={s.gradient}
        >
          {last ? "Start Coding" : "Next"}
          <ArrowRight className="h-4 w-4" />
        </GradientButton>
      </div>
    </main>
  );
}
