import React from "react";

function HeroSection() {
  return (
    <div
      className="hero min-h-[60vh] relative"
      style={{
        backgroundImage: "url(/images/background.jpg)",
      }}
    >
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80"></div>
      <div className="w-full flex justify-end items-end text-right z-20">
        <div className="max-w-md pr-4 md:pr-20">
          <h1 className="mb-5 text-3xl md:text-5xl font-bold drop-shadow-md">
            Let's get verified!
          </h1>
          <p className="mb-5 drop-shadow-md">
            Our web application simplifying certificate authentication. Swiftly
            confirm the legitimacy of educational, professional, and
            organizational credentials, ensuring trust and reliability in a
            seamless online experience.
          </p>
          <button className="btn btn-primary">Get Started</button>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
