import React from "react";

function HeroSection() {
  return (
    <div
      className="hero min-h-[80vh]"
      style={{
        backgroundImage: "url(/images/background.jpg)",
      }}
    >
      <div className="w-full flex justify-end items-end text-right">
        <div className="max-w-md pr-20">
          <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
          <p className="mb-5">
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>
          <button className="btn btn-primary">Get Started</button>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
