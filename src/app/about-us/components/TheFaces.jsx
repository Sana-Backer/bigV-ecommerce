import React from 'react';

const teamMembers = [
  {
    firstName: "Elena",
    lastName: "Rousseau",
    // Beautiful portrait placeholder for Elena
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000",
  },
  {
    firstName: "Camille",
    lastName: "Valmont",
    // Beautiful portrait placeholder for Camille
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=1000",
  },
  {
    firstName: "Maya",
    lastName: "Sterling",
    // Beautiful portrait placeholder for Maya
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=1000",
  }
];

export default function TheFaces() {
  return (
    <section className="w-full py-10">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-4xl md:text-4xl text-[#130D40] mb-3 tracking-tight">
            The <span className="font-yellowtail text-xl md:text-4xl font-normal text- px-1">faces</span> behind it
          </h2>
          <p className="text-[11px] md:text-xs tracking-tight text-[#767676] uppercase ">
            We built Aurae with people who care deeply about what they make.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="relative aspect-[3/3] overflow-hidden group bg-stone-200">
              <img 
                src={member.image} 
                alt={`${member.firstName} ${member.lastName}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1c2e]/80 via-[#1a1c2e]/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
              
              {/* Name Overlay */}
              <div className="absolute bottom-6 left-8 z-10 text-white">
                <h3 className="text-3xl md:text-[40px] font-medium leading-[1.1] tracking-tight">
                  {member.firstName}<br />
                  {member.lastName}
                </h3>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
