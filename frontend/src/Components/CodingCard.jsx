// CodingCard.jsx
import React from 'react';
// No need to import individual icons here; they are passed as props

const CodingCard = ({ IconComponent, title, description, buttonText, theme, onClick }) => {
  // Tailwind classes for theme-specific styling
  const themeClasses = {
    online: {
      card: 'border-purple-500 shadow-purple-500/50 hover:shadow-purple-400/60',
      button: 'bg-orange-600 hover:bg-orange-500',
    },
    friends: {
      card: 'border-blue-500 shadow-blue-500/50 hover:shadow-blue-400/60',
      button: 'bg-purple-600 hover:bg-purple-500',
    },
    practice: {
      card: 'border-green-500 shadow-green-500/50 hover:shadow-green-400/60',
      button: 'bg-blue-600 hover:bg-blue-500',
    },
  };

  const currentTheme = themeClasses[theme] || themeClasses.online; // Default to online if theme is not recognized

  return (
    <div
      className={`
        relative flex flex-col items-center p-8 bg-gray-800 rounded-xl
        border-2 transition-all duration-300 ease-in-out
        transform hover:-translate-y-2
        shadow-xl hover:shadow-2xl
        min-h-[350px] justify-between
        ${currentTheme.card}
      `}
    >
      {/* Icon - Now renders a React component directly */}
      <div className="mb-5">
        {IconComponent && (
          <IconComponent
            className="w-20 h-20 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
          />
        )}
      </div>

      {/* Title */}
      <h2 className="text-3xl font-bold mb-3 tracking-wide text-white">
        {title}
      </h2>

      {/* Description */}
      <p className="text-base text-gray-300 text-center mb-6 flex-grow">
        {description}
      </p>

      {/* Button */}
      <button
        onClick={onClick}
        className={`
          py-3 px-6 rounded-lg text-lg font-semibold text-white
          transition-colors duration-300 ease-in-out
          w-full max-w-[250px]
          ${currentTheme.button}
        `}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default CodingCard;