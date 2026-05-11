"use client";

import { useState } from "react";

export default function AdvancedAgroBotContact() {
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    farmSize: "",
    projectType: "",
    budget: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 2000)
      );

      setSuccess(true);

      setFormData({
        fullName: "",
        company: "",
        email: "",
        phone: "",
        country: "",
        farmSize: "",
        projectType: "",
        budget: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#080808] text-white">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_35%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_30%)]" />

      <div className="relative z-10 max-w-[1700px] mx-auto px-6 sm:px-10 lg:px-16 py-20 lg:py-28">

        {/* HEADER */}
        <div className="mb-16 max-w-3xl">

          <p className="text-[#8f8f8f] text-sm tracking-[0.35em] uppercase">
            Contact AgroBot
          </p>

          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.05em] leading-[0.95]">
            Let’s Build
            <span className="text-[#cfcfcf]"> Smart Farming</span>
          </h1>

          <p className="mt-6 text-[#a4a4a4] text-sm sm:text-base leading-relaxed max-w-2xl">
            Connect with the AgroBot team for autonomous farming systems,
            AI-powered agriculture solutions, precision irrigation,
            crop monitoring, robotics integration, and smart farming automation.
          </p>

        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.3fr] gap-10">

          {/* LEFT INFO PANEL */}
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 lg:p-10 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">

            <div>
              <p className="text-[#8f8f8f] text-sm uppercase tracking-[0.25em]">
                Contact Information
              </p>

              <div className="mt-10 space-y-8">

                <div>
                  <p className="text-[#7a7a7a] text-sm mb-2">
                    Email
                  </p>

                  <p className="text-white text-lg font-medium tracking-wide">
                    aakashkavediya@gmail.com
                  </p>
                </div>

                <div>
                  <p className="text-[#7a7a7a] text-sm mb-2">
                    Headquarters
                  </p>

                  <p className="text-white text-lg font-medium tracking-wide">
                    Mumbai, India
                  </p>
                </div>

                <div>
                  <p className="text-[#7a7a7a] text-sm mb-2">
                    Platform
                  </p>

                  <p className="text-white text-lg font-medium tracking-wide">
                    AI Autonomous Farming Ecosystem
                  </p>
                </div>

              </div>
            </div>

            {/* FEATURE BLOCKS */}
            <div className="mt-14 space-y-5">

              {[
                {
                  title: "Autonomous Navigation",
                  desc: "GPS-guided farming robots for real agricultural environments.",
                },
                {
                  title: "Disease Detection",
                  desc: "AI-powered crop monitoring and intelligent plant analysis.",
                },
                {
                  title: "Precision Irrigation",
                  desc: "Smart water management and automated irrigation systems.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <h3 className="text-white font-semibold text-lg">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-[#9f9f9f] text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}

            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="rounded-[32px] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 lg:p-10 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">

            <div className="mb-10">
              <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.04em] text-white">
                Send Inquiry
              </h2>

              <p className="mt-3 text-[#9d9d9d] text-sm sm:text-base">
                Fill in the details below and our team will connect with you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* ROW 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <InputField
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                />

                <InputField
                  label="Company / Organization"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="AgriTech Pvt Ltd"
                />

              </div>

              {/* ROW 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                />

                <InputField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                />

              </div>

              {/* ROW 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <InputField
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="India"
                />

                <InputField
                  label="Farm Size"
                  name="farmSize"
                  value={formData.farmSize}
                  onChange={handleChange}
                  placeholder="50 Acres"
                />

              </div>

              {/* ROW 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <SelectField
                  label="Project Type"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleChange}
                  options={[
                    "Autonomous Farming",
                    "AI Crop Monitoring",
                    "Precision Irrigation",
                    "Research Collaboration",
                    "Custom Robotics",
                  ]}
                />

                <SelectField
                  label="Estimated Budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  options={[
                    "$1K - $5K",
                    "$5K - $20K",
                    "$20K - $50K",
                    "$50K+",
                  ]}
                />

              </div>

              {/* MESSAGE */}
              <div>
                <label className="block text-sm text-[#b5b5b5] mb-3">
                  Project Details
                </label>

                <textarea
                  name="message"
                  rows={7}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your project, requirements, farming challenges, or collaboration goals..."
                  className="w-full rounded-3xl border border-white/10 bg-[#121212] px-5 py-4 text-white outline-none placeholder:text-[#666] focus:border-[#bfbfbf] transition resize-none"
                />
              </div>

              {/* SUBMIT */}
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#d7d7d7] via-[#a9a9a9] to-[#6d6d6d] text-black font-semibold hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Submit Inquiry"}
                </button>

                {success && (
                  <p className="text-[#cfcfcf] text-sm">
                    Your inquiry has been submitted successfully.
                  </p>
                )}

              </div>

            </form>

          </div>

        </div>

      </div>
    </section>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="block text-sm text-[#b5b5b5] mb-3">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-[#121212] px-5 py-4 text-white outline-none placeholder:text-[#666] focus:border-[#bfbfbf] transition"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="block text-sm text-[#b5b5b5] mb-3">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-white/10 bg-[#121212] px-5 py-4 text-white outline-none focus:border-[#bfbfbf] transition"
      >
        <option value="">
          Select option
        </option>

        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
