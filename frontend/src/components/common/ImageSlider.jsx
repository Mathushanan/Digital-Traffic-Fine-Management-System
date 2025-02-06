import React, { useState, useEffect } from "react";
import logo1 from "../../assets/image-slider-01.jpg"; // Ensure this is the correct path
import logo2 from "../../assets/image-slider-02.jpg";
import logo3 from "../../assets/image-slider-03.jpg";
import logo4 from "../../assets/image-slider-04.jpg";

const ImageSlider = () => {
  const [index, setIndex] = useState(0);

  const images = [
    {
      src: logo1,
      alt: "First slide",
      caption: "This is the first slide of the image slider",
    },
    {
      src: logo2,
      alt: "Second slide",
      caption: "Here’s the second slide",
    },
    {
      src: logo3,
      alt: "Third slide",
      caption: "This is the third slide",
    },
    {
      src: logo4,
      alt: "Third slide",
      caption: "This is the third slide",
    },
  ];

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Clean up the interval when the component unmounts
  }, []);

  useEffect(() => {
    document.querySelectorAll(".carousel-item").forEach((item, idx) => {
      item.style.transition = "opacity 1.5s ease, transform 1.5s ease";
      item.style.opacity = index === idx ? 1 : 0.4;
      item.style.transform = index === idx ? "scale(1)" : "scale(0.9)";
    });
  }, [index]);

  return (
    <div
      id="imageSlider"
      className="carousel slide"
      data-bs-ride="carousel"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }} // Slightly transparent background
    >
      <div className="carousel-inner">
        {images.map((image, idx) => (
          <div
            key={idx}
            className={`carousel-item ${index === idx ? "active" : ""}`}
          >
            <img
              src={image.src}
              className="d-block w-100"
              alt={image.alt}
              style={{
                objectFit: "cover", // Ensures the image covers the entire container
                opacity: 0.9, // Lower opacity to reduce transparency
              }}
            />
            <div
              className="carousel-caption d-none d-md-block"
              style={{
                color: "#fff", // White text for visibility
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)", // Text shadow for better contrast
                bottom: "20%", // Position the caption lower
              }}
            ></div>
          </div>
        ))}
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#imageSlider"
        data-bs-slide="prev"
        onClick={() =>
          handleSelect((index - 1 + images.length) % images.length)
        }
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#imageSlider"
        data-bs-slide="next"
        onClick={() => handleSelect((index + 1) % images.length)}
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default ImageSlider;
