"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function VideoGallery() {
  const [isMuted, setIsMuted] = useState(true);
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const videoRefs = [useRef(null), useRef(null), useRef(null)];

  const videos = [
    {
      id: 1,
      title: "AUTONOMOUS NAVIGATION",
      subtitle: "AI-Powered Field Navigation",
      description: "AgroBot navigates autonomously through crop rows using advanced computer vision and GPS-guided path planning.",
      stats: "2.5 km/h · 98% Accuracy",
      src: "/videos/one.mp4",
      color: "#FF6B00"
    },
    {
      id: 2,
      title: "DISEASE DETECTION",
      subtitle: "Real-time Crop Health Monitoring",
      description: "Advanced AI algorithms detect early signs of crop diseases with 98% accuracy, enabling immediate treatment response.",
      stats: "3 sec/plant · 94% Early Detection",
      src: "/videos/two.mp4",
      color: "#30D158"
    },
    {
      id: 3,
      title: "PRECISION SPRAYING",
      subtitle: "Targeted Treatment System",
      description: "Precision spraying technology reduces pesticide usage by 60% while maximizing crop protection effectiveness.",
      stats: "60% Less Waste · 95% Coverage",
      src: "/videos/three.mp4",
      color: "#0A84FF"
    }
  ];

  // Auto-play all videos when component mounts
  useEffect(() => {
    videoRefs.forEach((ref, index) => {
      if (ref.current) {
        ref.current.play().catch(e => console.log("Auto-play prevented:", e));
        ref.current.loop = true;
      }
    });
  }, []);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    videoRefs.forEach(ref => {
      if (ref.current) {
        ref.current.muted = newMutedState;
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
        padding: "32px 48px 0 48px",
        marginBottom: "24px"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "20px"
        }}>
          <div>
            <div style={{
              fontSize: "11px",
              fontWeight: "600",
              color: "#FF6B00",
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginBottom: "8px"
            }}>
              AGROBOT · AI FARMING SOLUTIONS
            </div>
            <h1 style={{
              fontSize: "32px",
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
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              color: "#fff",
              fontSize: "12px",
              fontWeight: "500"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {isMuted ? "Unmute All" : "Mute All"}
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div style={{
        position: "relative",
        zIndex: 10,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "24px",
        padding: "0 48px 48px 48px",
        height: "calc(100vh - 140px)"
      }}>
        
        {videos.map((video, index) => (
          <div
            key={video.id}
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              animation: "fadeInUp 0.6s ease-out",
              animationDelay: `${index * 0.1}s`,
              animationFillMode: "both"
            }}
            onMouseEnter={() => setHoveredVideo(index)}
            onMouseLeave={() => setHoveredVideo(null)}
          >
            {/* Video Container */}
            <div style={{
              position: "relative",
              borderRadius: "20px",
              overflow: "hidden",
              background: "#000",
              boxShadow: hoveredVideo === index 
                ? "0 20px 40px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,107,0,0.3)"
                : "0 10px 30px rgba(0,0,0,0.3)",
              transition: "all 0.3s ease",
              flex: 1,
              minHeight: 0
            }}>
              <video
                ref={videoRefs[index]}
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
                  padding: "20px",
                  transition: "opacity 0.3s"
                }}>
                  <div style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center"
                  }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(255,107,0,0.9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#fff"
                    }}>
                      ▶
                    </div>
                    <span style={{ fontSize: "12px", color: "#fff" }}>Playing now</span>
                  </div>
                </div>
              )}

              {/* Video Stats Badge */}
              <div style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "10px",
                color: video.color,
                fontFamily: "monospace",
                fontWeight: "600",
                letterSpacing: "0.5px"
              }}>
                {video.stats}
              </div>

              {/* Individual Mute Button on Hover */}
              {hoveredVideo === index && (
                <button
                  onClick={() => {
                    const videoEl = videoRefs[index].current;
                    videoEl.muted = !videoEl.muted;
                    // Update global mute state if all videos have same muted status
                    const allMuted = videoRefs.every(ref => ref.current?.muted);
                    setIsMuted(allMuted);
                  }}
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    right: "12px",
                    background: "rgba(0,0,0,0.7)",
                    backdropFilter: "blur(8px)",
                    border: "none",
                    borderRadius: "30px",
                    padding: "6px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                    fontSize: "10px",
                    color: "#fff",
                    transition: "all 0.2s"
                  }}
                >
                  {videoRefs[index].current?.muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  {videoRefs[index].current?.muted ? "Unmute" : "Mute"}
                </button>
              )}
            </div>

            {/* Video Info */}
            <div style={{
              padding: "16px 8px 8px 8px"
            }}>
              <div style={{
                fontSize: "10px",
                fontWeight: "600",
                color: video.color,
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "6px"
              }}>
                {video.subtitle}
              </div>
              <h3 style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#fff",
                marginBottom: "8px",
                letterSpacing: "-0.3px"
              }}>
                {video.title}
              </h3>
              <p style={{
                fontSize: "12px",
                lineHeight: "1.5",
                color: "#aaa",
                margin: 0
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
        bottom: "20px",
        left: "48px",
        right: "48px",
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(255,107,0,0.2), transparent)",
        pointerEvents: "none"
      }} />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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