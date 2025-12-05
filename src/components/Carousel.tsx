import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";

export default function Carousel() {
  const images = Object.values(
    import.meta.glob("/public/banners/*.{jpg,jpeg,png,webp}", {
      eager: true,
      import: "default",
    })
  ) as string[];

  return (
    <Swiper
      modules={[EffectCoverflow, Autoplay]}
      effect="coverflow"
      loop
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      centeredSlides
      slidesPerView="auto"
      coverflowEffect={{
        rotate: 0,
        stretch: 0,
        depth: 150,
        modifier: 1.8,
        slideShadows: false,
      }}
      className="w-full h-[500px] sm:h-[500px] md:h-[580px] lg:h-[900px] "
    >
      {images.map((src, i) => (
        <SwiperSlide
          key={i}
          className="w-[85%] sm:w-[80%] md:w-[60%] lg:w-[80%] h-full flex items-center justify-center"
        >
          <img src={src} className="w-full h-full object-cover rounded-xl" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
