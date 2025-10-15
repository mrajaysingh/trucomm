'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaWindows, FaApple, FaLinux } from 'react-icons/fa';

type CosmicPortalButtonProps = {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  label?: string;
  className?: string;
  showSystemIcon?: boolean;
  isDownloading?: boolean;
};

export default function CosmicPortalButton({ onClick, label = 'Download', className, showSystemIcon = true, isDownloading = false }: CosmicPortalButtonProps) {
  const [os, setOs] = useState<'windows' | 'mac' | 'linux'>('windows');

  useEffect(() => {
    // Auto-detect OS
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mac')) {
      setOs('mac');
    } else if (userAgent.includes('linux')) {
      setOs('linux');
    } else {
      setOs('windows');
    }
  }, []);

  const getOsIcon = () => {
    switch (os) {
      case 'mac':
        return <FaApple className="w-5 h-5" />;
      case 'linux':
        return <FaLinux className="w-5 h-5" />;
      default:
        return <FaWindows className="w-5 h-5" />;
    }
  };

  return (
    <StyledWrapper className={`${className ? className + ' ' : ''}cursor-target`}>
      <button className="cosmic-portal-btn" onClick={onClick} disabled={isDownloading}>
        <span className="btn-text">
          {isDownloading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{label}</span>
            </span>
          ) : showSystemIcon ? (
            <span className="flex items-center gap-2">
              <span>{label}</span>
              {getOsIcon()}
            </span>
          ) : (
            label
          )}
        </span>
        <div className="portal-effect" />
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .cosmic-portal-btn {
    --btn-bg: #1a1a2e;
    --btn-color: #e94560;
    --btn-highlight: #16213e;
    --portal-color1: #0f3460;
    --portal-color2: #e94560;

    position: relative;
    font-family: Arial, sans-serif;
    font-size: 1rem; /* match text-base */
    font-weight: bold;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--btn-color);
    background-color: var(--btn-bg);
    border: none;
    padding: 0.75rem 1.5rem; /* match py-3 px-6 */
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    clip-path: polygon(0% 0%, 100% 0%, 100% 70%, 90% 100%, 10% 100%, 0% 70%);
    width: 100%; /* fill container for w-full */
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* match sm:px-8 */
  @media (min-width: 640px) {
    .cosmic-portal-btn {
      padding-left: 2rem;
      padding-right: 2rem;
      width: auto; /* allow content width when container is auto */
    }
  }

  .cosmic-portal-btn::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      from 0deg at 50% 50%,
      var(--portal-color1) 0deg,
      var(--portal-color2) 120deg,
      var(--portal-color1) 240deg,
      var(--portal-color2) 360deg
    );
    animation: rotatePortal 10s linear infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .cosmic-portal-btn:hover::before {
    opacity: 0.8;
  }

  .cosmic-portal-btn::after {
    content: "";
    position: absolute;
    inset: 0.15em;
    background-color: var(--btn-bg);
    clip-path: inherit;
    z-index: 1;
  }

  .btn-text {
    position: relative;
    z-index: 2;
  }

  .portal-effect {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 50% 50%,
      var(--btn-highlight),
      transparent 50%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1;
  }

  .cosmic-portal-btn:hover .portal-effect {
    opacity: 1;
    animation: pulsePortal 2s ease-in-out infinite;
  }

  .cosmic-portal-btn:hover {
    transform: translateY(-0.25em);
    box-shadow: 0 0.5em 1em rgba(233, 69, 96, 0.2);
  }

  .cosmic-portal-btn:active {
    transform: translateY(0);
  }

  .cosmic-portal-btn:focus {
    outline: none;
    box-shadow: 0 0 0 0.2em rgba(233, 69, 96, 0.5);
  }

  @keyframes rotatePortal {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes pulsePortal {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cosmic-portal-btn::before,
    .cosmic-portal-btn:hover .portal-effect {
      animation: none;
    }
  }
`;


