import React from 'react';

const WhoWeAre = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative">
            <img
              src="/images/team/Team.jpeg"  // Direct path to image in public folder
              alt="Support Team"
              className="rounded-lg shadow-xl w-full h-auto"
              loading="lazy"
            />
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-900">Who we are?</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              The legal definition of a charitable organization (and of charity) 
              varies between countries and in some instances regions of the country. 
              The regulation, the tax treatment, and the way in which charity law 
              affects charitable organizations also vary.
            </p>
            <a
              href="/about"
              className="inline-block px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;