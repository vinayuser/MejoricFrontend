import React from "react";
import { FaShieldAlt, FaUserCheck } from "react-icons/fa";
import soulImage from "../../../assets/img/mentor-soul-card.jpg";
import "./MentorSoulSection.css";

export default function MentorSoulSection({ onFindMentor }) {
  return (
    <section className="mp-soul" aria-labelledby="mp-soul-heading">
      <div className="mp-soul-inner">
        <div className="mp-soul-media">
          <img
            src={soulImage}
            alt="Mentor and mentee in a supportive conversation"
            className="mp-soul-img"
          />
          <div className="mp-soul-quote">
            <p>“The right mentor at the right time changes everything.”</p>
            <span className="pl-2">  Mejoric Philosophy</span>
          </div>
        </div>

        <div className="mp-soul-copy">
          <h2 id="mp-soul-heading" className="mp-soul-title">
          Professionalism with Confidentiality
          </h2>
          <p className="mp-soul-lead">
            We believe that mental health and professional growth are
            intrinsically linked. Our domains are curated to provide holistic
            support from the clinical precision of legal clarity to the
            empathetic warmth of family mentoring.
          </p>

          <ul className="mp-soul-points">
            <li>
              <span className="mp-soul-icon" aria-hidden="true">
                <FaUserCheck />
              </span>
              <div>
                <h3>Verified Experts</h3>
                <p>
                  Every mentor is rigorously vetted for both clinical empathy
                  and professional excellence.
                </p>
              </div>
            </li>
            <li>
              <span className="mp-soul-icon mp-soul-icon-secondary" aria-hidden="true">
                <FaShieldAlt />
              </span>
              <div>
                <h3>Confidentiality Safety</h3>
                <p>
                  A secure, confidential harbor for discussing your most
                  challenging career and life pivots.
                </p>
              </div>
            </li>
          </ul>

          <button type="button" className="mp-soul-cta" onClick={onFindMentor}>
            Find Your Mentor Now
          </button>
        </div>
      </div>
    </section>
  );
}
