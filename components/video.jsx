"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function VideoGallery() {
  const [isMuted, setIsMuted] = useState(true);
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const videoRefs = useRef([]);

  const videos = [
  {
    id: 1,
    title: "Agrobot Structure",
    subtitle: "AI-Powered Field Navigation",
    description:
      "Explore the AgroBot's physical structure, robotic arm, and field setup designed to support autonomous crop monitoring and precision farming.",
    stats: "2.5 km/h · 98% Accuracy",
    src: "/videos/one.mp4",
    color: "#FF6B00"
  },
  {
    id: 2,
    title: "SLAM Architecture",
    subtitle: "Real-Time Mapping & Localization",
    description:
      "Visualize the robot's SLAM architecture as it builds a map of its surroundings and estimates its position for autonomous navigation.",
    stats: "3 sec/plant · 94% Early Detection",
    src: "/videos/two.mp4",
    color: "#30D158"
  },
  {
    id: 3,
    title: "Precision Spraying",
    subtitle: "Targeted Treatment System",
    description:
      "See the targeted treatment system designed to apply pesticides precisely where needed, minimizing chemical waste and protecting healthy crops.",
    stats: "60% Less Waste · 95% Coverage",
    src: "/videos/three.mp4",
    color: "#0A84FF"
  },
  {
    id: 4,
    title: "Voice Controlled",
    subtitle: "Intelligent Robot Control",
    description:
      "Interact with AgroBot through voice commands to control robot operations and simplify field navigation and farming tasks.",
    stats: "30% Faster · 99% Accuracy",
    src: "/videos/four.mp4",
    color: "#FF375F"
  },
  {
    id: 5,
    title: "Field Mapping",
    subtitle: "Real-Time Ground Assessment",
    description:
      "Watch AgroBot navigate real-world terrain while mapping its surroundings to support autonomous movement and field assessment.",
    stats: "5 sec/sample · 97% Precision",
    src: "/videos/five.mp4",
    color: "#64D2FF"
  },
  {
    id: 6,
    title: "Disease Detection",
    subtitle: "AI-Powered Crop Disease Segmentation",
    description:
      "See AI-powered image segmentation identify diseased crop regions using visual masks, enabling localized disease assessment and targeted intervention.",
    stats: "92% Accuracy · 40% Less Herbicide",
    src: "/videos/six.mp4",
    color: "#FFD60A"
  }
];

  // Initialize refs array
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, videos.length);
  }, []);

  // Auto-play all videos when component mounts
  useEffect(() => {
    videoRefs.current.forEach((ref) => {
      if (ref) {
        ref.play().catch(e => console.log("Auto-play prevented:", e));
        ref.loop = true;
      }
    });
  }, []);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    videoRefs.current.forEach(ref => {
      if (ref) {
        ref.muted = newMutedState;
      }
    });
  };

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#0a0a0a",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      
      {/* Matte Black Gradient Background */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse at 50% 30%, rgba(30,30,35,0.3) 0%, #0a0a0a 100%)",
        pointerEvents: "none"
      }} />

      {/* Subtle Grid Pattern */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "50px 50px",
        pointerEvents: "none"
      }} />

      {/* Header */}
      <div style={{
        position: "relative",
        zIndex: 10,
        padding: "20px 32px 0 32px",
        marginBottom: "16px"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "12px"
        }}>
          <div>
            <div style={{
              fontSize: "10px",
              fontWeight: "600",
              color: "#FF6B00",
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginBottom: "4px"
            }}>
              AGROBOT · AI FARMING SOLUTIONS
            </div>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#fff",
              letterSpacing: "-0.02em",
              margin: 0
            }}>
              Watch AgroBot in Action
            </h1>
          </div>
          
          {/* Global Mute Button */}
          <button
            onClick={toggleMute}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "40px",
              padding: "6px 14px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              transition: "all 0.2s",
              color: "#fff",
              fontSize: "11px",
              fontWeight: "500"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            {isMuted ? "Unmute All" : "Mute All"}
          </button>
        </div>
      </div>

      {/* Video Grid - 3 columns x 2 rows */}
      <div style={{
        position: "relative",
        zIndex: 10,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "1fr 1fr",
        gap: "12px",
        padding: "0 32px 20px 32px",
        height: "calc(100vh - 100px)"
      }}>
        
        {videos.map((video, index) => (
          <div
            key={video.id}
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              animation: "fadeInUp 0.6s ease-out",
              animationDelay: `${index * 0.08}s`,
              animationFillMode: "both"
            }}
            onMouseEnter={() => setHoveredVideo(index)}
            onMouseLeave={() => setHoveredVideo(null)}
          >
            {/* Video Container - Landscape */}
            <div style={{
              position: "relative",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#000",
              boxShadow: hoveredVideo === index 
                ? "0 10px 30px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,107,0,0.3)"
                : "0 4px 15px rgba(0,0,0,0.3)",
              transition: "all 0.3s ease",
              flex: 1,
              minHeight: 0,
              aspectRatio: "16/9"
            }}>
              <video
                ref={el => videoRefs.current[index] = el}
                src={video.src}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block"
                }}
                autoPlay
                loop
                muted={isMuted}
                playsInline
              />
              
              {/* Hover Overlay */}
              {hoveredVideo === index && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(transparent 60%, rgba(0,0,0,0.8) 100%)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "12px 16px",
                  transition: "opacity 0.3s"
                }}>
                  <div style={{
                    display: "flex",
                    gap: "6px",
                    alignItems: "center"
                  }}>
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "rgba(255,107,0,0.9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "600",
                      color: "#fff"
                    }}>
                      ▶
                    </div>
                    <span style={{ fontSize: "11px", color: "#fff" }}>Playing now</span>
                  </div>
                </div>
              )}

              {/* Video Stats Badge */}
              <div style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "9px",
                color: video.color,
                fontFamily: "monospace",
                fontWeight: "600",
                letterSpacing: "0.3px"
              }}>
                {video.stats}
              </div>

              {/* Individual Mute Button on Hover */}
              {hoveredVideo === index && (
                <button
                  onClick={() => {
                    const videoEl = videoRefs.current[index];
                    if (videoEl) {
                      videoEl.muted = !videoEl.muted;
                      // Update global mute state if all videos have same muted status
                      const allMuted = videoRefs.current.every(ref => ref?.muted);
                      setIsMuted(allMuted);
                    }
                  }}
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    background: "rgba(0,0,0,0.7)",
                    backdropFilter: "blur(8px)",
                    border: "none",
                    borderRadius: "20px",
                    padding: "4px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "pointer",
                    fontSize: "9px",
                    color: "#fff",
                    transition: "all 0.2s"
                  }}
                >
                  {videoRefs.current[index]?.muted ? <VolumeX size={10} /> : <Volume2 size={10} />}
                  {videoRefs.current[index]?.muted ? "Unmute" : "Mute"}
                </button>
              )}
            </div>

            {/* Video Info - Compact */}
            <div style={{
              padding: "8px 4px 2px 4px"
            }}>
              <div style={{
                fontSize: "8px",
                fontWeight: "600",
                color: video.color,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginBottom: "2px"
              }}>
                {video.subtitle}
              </div>
              <h3 style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#fff",
                marginBottom: "3px",
                letterSpacing: "-0.2px",
                lineHeight: "1.2"
              }}>
                {video.title}
              </h3>
              <p style={{
                fontSize: "10px",
                lineHeight: "1.3",
                color: "#aaa",
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}>
                {video.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Decorative Line */}
      <div style={{
        position: "absolute",
        bottom: "10px",
        left: "32px",
        right: "32px",
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(255,107,0,0.2), transparent)",
        pointerEvents: "none"
      }} />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
} 