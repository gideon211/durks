import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";

export default function Carousel() {
  const images: string[] = [
    "/banners/aleanse-juice.jpeg",
    "/banners/cleanse-juice.webp",
  ];

  return (
    <>
      {/* Mobile Carousel */}
      <div className="lg:hidden">
        <Swiper
          modules={[EffectCoverflow, Autoplay]}
          effect="coverflow"
          loop
          autoplay={{ delay: 1000, disableOnInteraction: false }}
          centeredSlides
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 150,
            modifier: 1.8,
            slideShadows: false,
          }}
          className="w-full h-[28rem] sm:h-[32rem] md:h-[34rem]"
        >
          {images.map((src, i) => (
            <SwiperSlide
              key={i}
              className="w-[85%] sm:w-[80%] md:w-[60%] h-full flex items-center justify-center"
            >
              <img
                src={src}
                className="w-full h-full object-cover rounded-xl"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop Flex Row */}
      <div className="hidden lg:flex gap-4 h-[36rem]">
        {images.map((src, i) => (
          <div key={i} className="flex-1 h-full overflow-hidden rounded-xl">
            <img
              src={src}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </>
  );
}
