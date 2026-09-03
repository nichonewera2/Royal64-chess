import type { Color, PieceSymbol } from 'chess.js';

/**
 * Hand-built Staunton-style chess piece silhouettes — replaces the earlier
 * Unicode glyph rendering (♔♕♖♗♘♙), which looked flat and font-dependent
 * and had poor contrast against the wood board regardless of outline
 * tricks. These are original vector shapes (not traced from any existing
 * icon font or licensed piece set) built from basic primitives — a
 * recognizable king/queen/bishop/knight/rook/pawn silhouette, not a
 * pixel-perfect replica of any particular commercial set.
 *
 * Every piece shares the same 45×45 viewBox (the conventional chess-piece
 * SVG convention) so they scale identically on the board regardless of
 * type. Detail marks (bishop's mitre cut, knight's eye/nostril) are drawn
 * in the OPPOSITE contrast color from the piece body, so they stay
 * readable whether the piece is White or Black.
 */

interface PieceGraphicProps {
  type: PieceSymbol;
  color: Color;
}

interface PalKeys {
  fill: string;
  stroke: string;
  detail: string;
}

const PALETTE: Record<Color, PalKeys> = {
  w: { fill: '#faf1de', stroke: '#2a1d12', detail: '#2a1d12' },
  b: { fill: '#1c130a', stroke: '#e3c691', detail: '#e3c691' }
};

export function PieceGraphic({ type, color }: PieceGraphicProps) {
  const { fill, stroke, detail } = PALETTE[color];
  const common = { fill, stroke, strokeWidth: 1.1, strokeLinejoin: 'round' as const };

  switch (type) {
    case 'p':
      return (
        <g>
          <ellipse cx="22.5" cy="38.5" rx="9.5" ry="3" {...common} />
          <path d="M16.5 36.5 C16.5 27 19 21 22.5 19 C26 21 28.5 27 28.5 36.5 Z" {...common} />
          <circle cx="22.5" cy="13.5" r="6.2" {...common} />
        </g>
      );

    case 'r':
      return (
        <g>
          <rect x="13.5" y="32" width="18" height="6" rx="1" {...common} />
          <path
            d="M15 32 L15 16 L18 16 L18 19 L21 19 L21 16 L24 16 L24 19 L27 19 L27 16 L30 16 L30 32 Z"
            {...common}
          />
          <rect x="14.5" y="28" width="16" height="2.4" opacity="0.18" fill={detail} stroke="none" />
        </g>
      );

    case 'n':
      return (
        <g>
          <ellipse cx="22.5" cy="38.5" rx="9.5" ry="3" {...common} />
          <path
            d="M14.5 37 C14.5 30 15.5 25 18 22 C16.3 19.5 15.6 17 16.5 14
               C17.5 11 20 9 23 9 C26 9 28 11 29.2 14
               C30.2 16.3 30.8 18.4 29.7 20.2
               C28.8 21.3 27 21.4 25.8 20.4
               L24.2 23 C22.2 24.2 20.2 26.3 19 29.2
               C18 32 17.3 35 17.3 37 Z"
            {...common}
          />
          <path d="M20.3 10.2 L22.8 4.5 L25 10.4 Z" {...common} />
          <circle cx="24.3" cy="14.8" r="1.15" fill={detail} stroke="none" />
          <circle cx="28.6" cy="18.8" r="0.95" fill={detail} stroke="none" />
        </g>
      );

    case 'b':
      return (
        <g>
          <ellipse cx="22.5" cy="38.5" rx="9.5" ry="3" {...common} />
          <path d="M15.5 36 C15.5 27 17.5 20 22.5 17 C27.5 20 29.5 27 29.5 36 Z" {...common} />
          <circle cx="22.5" cy="13" r="5.6" {...common} />
          <line x1="19.2" y1="10.3" x2="25.8" y2="15.7" stroke={detail} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="22.5" cy="5.5" r="2" {...common} />
        </g>
      );

    case 'q':
      return (
        <g>
          <ellipse cx="22.5" cy="39" rx="10.5" ry="3" {...common} />
          <path
            d="M16.3 36 C16.3 28 17.3 22 19.3 18 L19.3 14.5 L25.7 14.5 L25.7 18
               C27.7 22 28.7 28 28.7 36 Z"
            {...common}
          />
          <circle cx="16.8" cy="13" r="2" {...common} />
          <circle cx="20.3" cy="10.8" r="2" {...common} />
          <circle cx="22.5" cy="9.6" r="2.4" {...common} />
          <circle cx="24.7" cy="10.8" r="2" {...common} />
          <circle cx="28.2" cy="13" r="2" {...common} />
        </g>
      );

    case 'k':
      return (
        <g>
          <ellipse cx="22.5" cy="39" rx="10.5" ry="3" {...common} />
          <path
            d="M16.3 36 C16.3 28 17.3 22 19.3 18 L19.3 15.5 L25.7 15.5 L25.7 18
               C27.7 22 28.7 28 28.7 36 Z"
            {...common}
          />
          <rect x="18.3" y="12.5" width="8.4" height="3.6" rx="0.8" {...common} />
          <rect x="21.3" y="3" width="2.4" height="9" rx="0.5" {...common} />
          <rect x="18.5" y="5.7" width="8" height="2.4" rx="0.5" {...common} />
        </g>
      );

    default:
      return null;
  }
}
