import { useReducedMotion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Keyboard, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { TESTIMONIALS } from "@/config/content";
import { TestimonialCard } from "./HomeTrust";
import "swiper/css";

export function ReviewCarousel() {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");
  return (
    <div className="min-w-0 overflow-hidden">
      <Swiper
        modules={[Autoplay, A11y, Keyboard, Navigation]}
        loop={TESTIMONIALS.length > 3}
        speed={reduce ? 0 : 1100}
        autoplay={
          reduce ? false : { delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }
        }
        a11y={{ prevSlideMessage: "Previous review", nextSlideMessage: "Next review" }}
        keyboard={{ enabled: true, onlyInViewport: true }}
        navigation={{ prevEl: `.review-prev-${id}`, nextEl: `.review-next-${id}` }}
        spaceBetween={20}
        slidesPerView={1.08}
        breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
        aria-label="Client testimonials"
        className="!pb-1"
      >
        {TESTIMONIALS.map((t) => (
          <SwiperSlide key={t.name} className="!h-auto">
            <TestimonialCard t={t} />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="mt-5 flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          className={`review-prev-${id} rounded-full`}
          aria-label="Previous review"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={`review-next-${id} rounded-full`}
          aria-label="Next review"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
