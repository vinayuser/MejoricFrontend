import React from "react";
import Layout from "../Layout";
import Footer from "../Footer";

export default function MentorPlatformLayout({
  activePage = "Mentors",
  type,
  children,
}) {
  return (
    <Layout activePage={activePage}>
      <div className={`mp-root${type ? ` mp-${type}` : ""}`}>{children}</div>
      <Footer />
    </Layout>
  );
}
