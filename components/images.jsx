"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function BotImageGallery() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use every image available in public/images
  const botImages = [
    'one.jpeg',
    'two.jpeg',
    'three.jpeg',
    'four.jpeg',
    'five.jpeg',
    'six.jpeg',
    'seven.jpeg',
    'eight.jpeg',
    'nine.jpeg',
    'ten.jpeg',
    'eleven.jpeg',
    'twelve.jpeg',
    'thirteen.jpeg',
    'fourteen.jpeg',
    'fifteen.jpeg',
    'sisteen.jpeg',
    'seventeen.jpeg',
    'eighteen.jpeg',
    'nineteen.jpeg',
    'twenty.jpeg',
    'twentyone.jpeg',
  ].map((fileName, index) => ({
    id: index + 1,
    image: `/images/${fileName}`,
  }));

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setSelectedImage(botImages[index]);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const newIndex = (currentIndex + 1) % botImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(botImages[newIndex]);
  };

  const prevImage = () => {
    const newIndex = (currentIndex - 1 + botImages.length) % botImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(botImages[newIndex]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImage) {
        if (e.key === "ArrowLeft") prevImage();
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "Escape") closeLightbox();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, currentIndex]);

  return (
    <div style={{
      width: "100vw",
      minHeight: "100vh",
      background: "#000000",
      position: "relative",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, sans-serif"
    }}>
      
      {/* Header - Clean, no extra darkness */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(0,0,0,0.95)",
        borderBottom: "0.5px solid rgba(255,255,255,0.06)",
        padding: "20px 24px"
      }}>
        <div>
          <div style={{
            fontSize: "10px",
            fontWeight: "600",
            color: "#FF6B00",
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: "6px"
          }}>
            AGROBOT FLEET
          </div>
          <div style={{
            fontSize: "28px",
            fontWeight: "600",
            color: "#fff",
            letterSpacing: "-0.5px"
          }}>
            Bot Gallery
            <span style={{
              fontSize: "14px",
              color: "#666",
              fontWeight: "400",
              marginLeft: "10px"
            }}>
              {botImages.length} Units
            </span>
          </div>
        </div>
      </div>

      {/* Image Grid - Pure black background */}
      <div style={{
        padding: "24px"
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px"
        }}>
          {botImages.map((bot, index) => (
            <div
              key={bot.id}
              onClick={() => openLightbox(index)}
              style={{
                position: "relative",
                background: "#0a0a0a",
                borderRadius: "16px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                border: "0.5px solid rgba(255,255,255,0.05)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.border = "0.5px solid rgba(255,107,0,0.3)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.border = "0.5px solid rgba(255,255,255,0.05)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Image Container */}
              <div style={{
                position: "relative",
                aspectRatio: "4/3",
                background: "#080808",
                overflow: "hidden"
              }}>
                {/* Placeholder while image loads */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "#080808",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "rgba(255,107,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px"
                  }}>
                    🤖
                  </div>
                </div>
                
                {/* Actual Image */}
                <img
                  src={bot.image}
                  alt={`Bot ${bot.id}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "relative",
                    zIndex: 1
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                
                {/* Hover Overlay - Only appears on hover */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                    pointerEvents: "none"
                  }}
                  className="hover-overlay"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0";
                  }}
                >
                  <div style={{
                    background: "rgba(255,107,0,0.9)",
                    borderRadius: "30px",
                    padding: "8px 20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#fff",
                    letterSpacing: "0.5px"
                  }}>
                    VIEW → AGROBOT-{String(bot.id).padStart(3, "0")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox / Carousel Modal */}
      {selectedImage && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "#000000",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              zIndex: 1001
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
          >
            <X size={24} color="#fff" />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={prevImage}
            style={{
              position: "absolute",
              left: "24px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              zIndex: 1001
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
          >
            <ChevronLeft size={28} color="#fff" />
          </button>

          <button
            onClick={nextImage}
            style={{
              position: "absolute",
              right: "24px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              zIndex: 1001
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
          >
            <ChevronRight size={28} color="#fff" />
          </button>

          {/* Image Container */}
          <div style={{
            maxWidth: "85vw",
            maxHeight: "85vh",
            position: "relative"
          }}>
            <img
              src={selectedImage.image}
              alt={`Bot ${selectedImage.id}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "12px"
              }}
              onError={(e) => {
                e.target.src = "https://placehold.co/1200x900/1a1a1a/FF6B00?text=AGROBOT";
              }}
            />
            
            {/* Minimal Image Info */}
            <div style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              right: "20px",
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(12px)",
              borderRadius: "10px",
              padding: "10px 16px",
              border: "0.5px solid rgba(255,255,255,0.08)"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#fff"
                }}>
                  AGROBOT-{String(selectedImage.id).padStart(3, "0")}
                </span>
                <span style={{
                  fontSize: "11px",
                  color: "#FF6B00",
                  fontFamily: "monospace"
                }}>
                  {currentIndex + 1} / {botImages.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}