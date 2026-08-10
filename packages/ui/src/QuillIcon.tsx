import React from "react";

export const QuillIcon = ({ className = "w-16 h-16" }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="readixonFeather"
          x1="32"
          y1="92"
          x2="91"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#4A3F7B" />
          <stop offset="0.55" stopColor="#7768B0" />
          <stop offset="1" stopColor="#B8A9E5" />
        </linearGradient>

        <linearGradient
          id="readixonHighlight"
          x1="52"
          y1="73"
          x2="82"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#8F81C5" />
          <stop offset="1" stopColor="#D3CCF0" />
        </linearGradient>
      </defs>

      {/* =========================
          FEATHER
      ========================== */}

      <path
        d="
          M34 88
          C35 68 38 48 50 32
          C60 19 73 11 91 7
          C89 24 82 39 71 51
          C60 64 47 76 34 88Z
        "
        fill="url(#readixonFeather)"
      />

      {/* Tüyün içindeki karakteristik kırılma */}
      <path
        d="
          M43 73
          C55 61 66 49 74 37
          C82 25 87 15 91 7
          C88 24 81 39 70 52
          C61 63 52 70 43 73Z
        "
        fill="url(#readixonHighlight)"
        opacity="0.85"
      />

      {/* =========================
          FEATHER BARBS
      ========================== */}

      <path
        d="M39 76C37 67 35 59 36 52"
        stroke="#8C7CC2"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M43 69C40 59 39 51 41 44"
        stroke="#9C8DD0"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M48 62C45 52 46 43 49 36"
        stroke="#A99BD9"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M54 55C52 45 54 36 58 29"
        stroke="#B6A9E2"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Sağ taraf damarları */}
      <path
        d="M46 69C58 61 67 52 75 42"
        stroke="#DAD5F1"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.8"
      />

      <path
        d="M52 59C63 51 72 42 79 31"
        stroke="#E0DCF3"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.8"
      />

      <path
        d="M59 48C68 40 76 31 82 21"
        stroke="#E5E1F5"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* =========================
          CENTRAL SHAFT
      ========================== */}

      <path
        d="M34 88C46 67 58 51 71 36C79 26 86 15 91 7"
        stroke="#342D50"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* =========================
          PEN / NIB
      ========================== */}

      <path
        d="
          M34 87
          L19 104
          C18 105 19 107 21 106
          L39 91
          Z
        "
        fill="#2D2737"
      />

      {/* Nib highlight */}
      <path
        d="M20 104L34 89"
        stroke="#655A78"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* =========================
          SMALL READIXON DETAIL
          R'yi çağrıştıran negatif alan
      ========================== */}

      <path
        d="
          M58 48
          C63 44 68 39 72 34
          C69 34 66 35 64 37
          C62 40 60 44 58 48Z
        "
        fill="#4A3F7B"
        opacity="0.75"
      />

      {/* =========================
          DECORATIVE DOT
      ========================== */}

      <circle
        cx="96"
        cy="14"
        r="2.5"
        fill="#A99AE0"
      />

      <circle
        cx="101"
        cy="10"
        r="1.2"
        fill="#C9C1EB"
      />
    </svg>
  );
};
