import React from 'react';

export default function AboutPage() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-black text-white px-4 py-16">
      <div className="flex flex-col md:flex-row items-center justify-center max-w-4xl w-full bg-[#18181b] rounded-3xl shadow-2xl overflow-hidden">
        {/* Portrait Image */}
        <div className="flex-shrink-0 w-full md:w-1/2 flex items-center justify-center p-6 md:p-10">
          <img
            src="/about.jpg"
            alt="Karthik Narambatla portrait"
            className="rounded-2xl object-cover w-64 h-80 md:w-80 md:h-96 shadow-lg border-4 border-white/10 bg-gray-700"
          />
        </div>
        {/* About Text */}
        <div className="flex flex-col justify-center w-full md:w-1/2 p-6 md:p-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-left">Karthik Narambatla</h2>
          <p className="text-lg md:text-xl text-gray-300 mb-4 text-left font-medium">Photographer & Storyteller</p>
          <p className="text-base md:text-lg text-gray-200 mb-6 text-left">
            From golden crusts to sunlit spaces, I capture the soul of brands through food, interiors, and lifestyle—Hyderabad-based, heart-led, always chasing light and story.
          </p>
        </div>
      </div>
    </section>
  );
} 