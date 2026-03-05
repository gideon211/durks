import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"

export default function TrainingPreview() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* subtle top/bottom hairlines */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ambient light */}
      <div className="pointer-events-none absolute -top-28 right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[1240px] px-4 md:px-6">
        {/* Desktop: give it breathing room + better balance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* COPY */}
          <div className="lg:col-span-5 lg:pr-2">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <Badge className="rounded-full px-3 py-1" variant="secondary">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                DUKS Training
              </Badge>
            </div>

            <h2 className="mt-5 text-center text-black lg:text-left font-heading font-bold tracking-tight text-[clamp(2rem,3.2vw,3.25rem)] leading-[1.05]">
              Our Training Program
            </h2>

           
            <p className="mt-4 text-center  lg:text-left text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
            Learn the systems behind a real juice production business from hygiene to scalable operations.
            </p>

            {/* CTA row */}
            <div className="mt-7 hidden lg:flex justify-center lg:justify-start">
            <Link to="/training">
                <Button className="rounded-md py-5">
                Read more <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
            </div>

            <p className="mt-4 text-xs text-muted-foreground text-center lg:text-left">
              Next cohort dates are announced on the training page.
            </p>
          </div>

          {/* VISUAL */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl border bg-card/40 shadow-sm overflow-hidden">
              {/* glossy top highlight */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/40 to-transparent opacity-50" />
              {/* soft vignette */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-black/0" />

              {/* blurred fill */}
              <video
                className="absolute inset-0 h-full w-full object-cover blur-2xl scale-110 opacity-50"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              >
                <source src="/banners/training.mp4" type="video/mp4" />
              </video>

              

              {/* ✅ frame sizes: bigger + cleaner on desktop */}
              <div className="relative px-4 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-8">
                <div className="relative w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
                  <div className="relative h-[420px] sm:h-[460px] md:h-[520px] lg:h-[540px] xl:h-[600px]">
                    {/* sharp portrait centered */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative h-full w-auto max-w-[92%] overflow-hidden rounded-2xl shadow-2xl">
                        <video
                          className="h-full w-auto object-contain"
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        >
                          <source src="/banners/training.mp4" type="video/mp4" />
                        </video>
                      </div>
                    </div>

                    {/* caption */}
                    <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-3 rounded-2xl border bg-background/60 backdrop-blur px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">DUKS Training</p>
                          <p className="text-sm font-semibold leading-snug line-clamp-2">
                            Production • Hygiene • Costing • Operations
                          </p>
                        </div>

                        <Badge className="rounded-full shrink-0">Premium</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
            </div>

            <p className="mt-3 text-xs text-muted-foreground text-center lg:text-left">
              Real workflows. Repeatable results.
            </p>

            <div className="mt-6 flex lg:hidden justify-center">
                <Link to="/training">
                    <Button className="rounded-md py-5">
                    Read more <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}