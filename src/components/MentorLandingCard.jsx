import React, { memo } from "react";
import { capitalizeName } from "../utils/formatters";

const MentorLandingCard = memo(({ mentor, navigate }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col relative group">
    <div className="flex justify-center pt-8 pb-2">
      <div
        className="relative w-36 h-36 rounded-full bg-slate-50 overflow-hidden cursor-pointer border-4 border-white shadow-lg ring-2 ring-purple-100"
        onClick={() => navigate(`/mate-profile/${mentor._id}`)}
      >
        <img
          src={mentor.img}
          className="w-full h-full object-cover object-[center_20%]"
          loading="lazy"
          alt={mentor.name}
        />
      </div>
    </div>

    <div className="px-5 pb-5 flex-1 flex flex-col text-center">
      <h3
        className="font-bold text-lg text-slate-900 capitalize cursor-pointer hover:text-purple-600 transition-colors"
        onClick={() => navigate(`/mate-profile/${mentor._id}`)}
      >
        {capitalizeName(mentor.name)}
      </h3>
      <p className="text-purple-600 text-xs font-semibold mt-1 capitalize">
        {mentor.category}
      </p>
      {mentor.skills && (
        <p className="text-slate-500 text-xs mt-1 line-clamp-1">{mentor.skills}</p>
      )}

      <div className="flex flex-wrap justify-center gap-2 mt-3 mb-4">
        {(mentor.tags || []).slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wide"
          >
            {tag}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate(`/mate-profile/${mentor._id}`)}
        className="mt-auto w-full py-2.5 rounded-lg bg-white border-2 border-purple-500 text-purple-600 text-sm font-semibold hover:bg-purple-50 transition-colors"
      >
        Book Appointment
      </button>
    </div>
  </div>
));

MentorLandingCard.displayName = "MentorLandingCard";

export default MentorLandingCard;
