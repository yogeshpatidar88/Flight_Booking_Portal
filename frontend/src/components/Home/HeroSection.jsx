import React from "react";
import HeroSectionCard from "./HeroSectionCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const HeroSection = () => {
  const homeData = [
    {
      heading: "Explore the sights of the Andaman and Nicobar Islands",
      subheading: "The place called heaven on earth",
      src: "https://images.unsplash.com/photo-1620127682229-33388276e540",
    },
    {
      heading: "Discover the beauty of Paris",
      subheading: "City of Love",
      src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    },
    {
      heading: "Experience the wonders of New York City",
      subheading: "The city that never sleeps",
      src: "https://images.unsplash.com/flagged/photo-1575597255483-55f2afb6f42c",
    },
    {
      heading: "Marvel at the grandeur of the Grand Canyon",
      subheading: "Nature's masterpiece",
      src: "https://images.unsplash.com/photo-1615551043360-33de8b5f410c",
    },
    {
      heading: "Get lost in the charm of Kyoto",
      subheading: "Tradition meets modernity",
      src: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9",
    },
  ];

  return (
    <section className="max-w-[1800px] mx-auto w-full h-[90vh] mt-6 rounded-[25px] overflow-hidden relative shadow-xl">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        effect="fade"
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          bulletClass: "swiper-pagination-bullet bg-white opacity-70",
          bulletActiveClass: "swiper-pagination-bullet-active !bg-blue-500",
        }}
      >
        {homeData.map((data, index) => (
          <SwiperSlide key={index} className="h-[90vh]">
            <div className="relative h-full w-full">
              {/* Background Image */}
              <img
                src={data.src}
                alt={data.heading}
                className="w-full h-full object-cover"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              {/* Text overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 md:px-20">
                <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg animate-fadeInUp">
                  {data.heading}
                </h2>
                <p className="mt-4 text-lg md:text-2xl text-gray-200 drop-shadow-md animate-fadeInUp delay-150">
                  {data.subheading}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroSection;
