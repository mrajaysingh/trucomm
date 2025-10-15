"use client";
import Image from "next/image";
import styled from "styled-components";
export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 text-sm text-white/60">
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-3 items-center gap-4">
        <div className="justify-self-start">
          <span>
            © {new Date().getFullYear()} TruComm. All rights reserved.
          </span>
        </div>
        <div className="justify-self-center">
          <StyledWrapper>
            <a className="btn-glitch-fill" role="button" aria-label="Donate and save environment">
              <span className="text">Save Environment</span>
              <span className="text-decoration"> _</span>
              <span className="decoration">⇒</span>
            </a>
          </StyledWrapper>
        </div>
        <div className="justify-self-end">
          <a
            href="https://skyber.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <span>Powered by</span>
            <Image
              src="/logo/custom-cursor/skyber-sponser.png"
              alt="SKYBER logo"
              width={24}
              height={24}
              className="h-6 w-6 object-contain"
              priority
            />
            <span className="text-white">SKYBER</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

const StyledWrapper = styled.div`
  [class*="btn-glitch-"] {
    display: inline-block;
    font-family: "VT323", monospace;
    border: 1px solid rgb(0, 0, 0);
    color: rgb(0, 0, 0);
    padding: 10px 13px;
    min-width: 175px;
    line-height: 1.5em;
    white-space: nowrap;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 15px;
    background: #fff;

    .text,
    .decoration {
      display: inline-block;
    }

    .decoration { float: right; }

    &:hover,
    &:focus {
      animation-name: glitch;
      animation-duration: 0.2s;
      background-color: yellow;
      color: black;
      border: 1px solid yellow;

      .text-decoration { animation-name: blink; animation-duration: 0.1s; animation-iteration-count: infinite; }
      .decoration { animation-name: blink; animation-duration: 0.1s; animation-iteration-count: infinite; }
    }

    &:active {
      background: none;
      color: yellow;
      .text-decoration { animation-name: none; }
      .decoration { animation-name: none; }
      :before,
      :after { display: none; }
    }
  }

  @keyframes glitch {
    25% { background-color: red; transform: translateX(-10px); letter-spacing: 10px; }
    35% { background-color: green; transform: translate(10px); }
    59% { opacity: 0; }
    60% { background-color: blue; transform: translate(-10px); filter: blur(5px); }
    100% { background-color: yellow; }
  }

  @keyframes blink { 50% { opacity: 0; } }
`;
