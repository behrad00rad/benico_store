import React, { useState, useEffect, useRef } from 'react';

const ImageSlider = ({ uuids }) => {
  const [images, setImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(1);
  const sliderRef = useRef(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    fetchImages();
  }, [uuids]);

  const fetchImages = async () => {
    try {
      const responses = await Promise.all(
        uuids.map((uuid) => fetch(`http://127.0.0.1:2000/image/item/${uuid}/`))
      );

      const imageData = await Promise.all(
        responses.map((response) => response.blob())
      );

      const imageUrls = imageData.map((data) => URL.createObjectURL(data));
      setImages(imageUrls);
      setCurrentSlide(0); // Set the first slide as the initial slide
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide === 0) {
      return; // No previous slide
    }
    setCurrentSlide((prevSlide) => prevSlide - 1);
  };

  const handleNextSlide = () => {
    if (currentSlide === images.length - 1) {
      return; // No next slide
    }
    setCurrentSlide((prevSlide) => prevSlide + 1);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    const difference = touchStartX.current - e.touches[0].clientX;

    if (Math.abs(difference) > 50) {
      // Threshold to determine if it's a swipe
      if (difference > 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
      touchStartX.current = e.touches[0].clientX; // Update the starting position for the next touch move
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.style.transition = 'transform 0.5s ease-in-out';
      slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
  }, [currentSlide]);

  return (
    <div
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {images.length > 0 && (
        <div className="overflow-hidden">
          <div
            ref={sliderRef}
            className="flex transition-transform duration-500 ease-in-out -translate-x-full"
          >
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Slide ${index}`}
                className="w-full bg-[#fdfdfd]"
              />
            ))}
          </div>
          <button
            onClick={handlePrevSlide}
            className={`absolute top-1/2 left-0 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full  m-2 ${
              currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={currentSlide === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="42" height="42" className=" p-2 rounded-full">
              <path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z" fill="#fff" />
            </svg>
          </button>
          <button
            onClick={handleNextSlide}
            className={`absolute top-1/2 right-0 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full m-2  ${
              currentSlide === images.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={currentSlide === images.length - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="42" height="42" className=" p-2 rounded-full">
              <path d="M13.1714 12.0007L8.22168 7.05093L9.63589 5.63672L15.9999 12.0007L9.63589 18.3646L8.22168 16.9504L13.1714 12.0007Z" fill="#fff" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
