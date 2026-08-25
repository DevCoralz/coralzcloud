import type { FileKind } from "../data";

/**
 * Recognizable file-type glyphs (PDF, spreadsheet, document, image, video, archive)
 * rendered as clean flat SVG tiles in the app's file-type colors.
 */

const tileClass: Record<FileKind, string> = {
  pdf: "bg-file-pdf",
  sheet: "bg-file-sheet",
  doc: "bg-file-doc",
  image: "bg-file-image",
  video: "bg-file-video",
  archive: "bg-file-archive",
};

function Glyph({ kind }: { kind: FileKind }) {
  const common = { viewBox: "0 0 24 24", className: "size-6", "aria-hidden": true } as const;

  switch (kind) {
    case "pdf":
      return (
        <svg {...common} fill="none">
          <path
            d="M6 3h7.5L19 8.5V21H6z"
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M13.5 3v5.5H19" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <text
            x="12"
            y="17.6"
            textAnchor="middle"
            fontSize="6.4"
            fontWeight="700"
            fill="currentColor"
            fontFamily="Inter, system-ui, sans-serif"
          >
            PDF
          </text>
        </svg>
      );
    case "sheet":
      return (
        <svg {...common} fill="none">
          <rect
            x="4"
            y="3.5"
            width="16"
            height="17"
            rx="2.2"
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M4 9h16M4 14.5h16M9.8 9v11.5M15 9v11.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );
    case "doc":
      return (
        <svg {...common} fill="none">
          <path
            d="M6 3h7.5L19 8.5V21H6z"
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M13.5 3v5.5H19" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path
            d="M8.7 12h6.6M8.7 15h6.6M8.7 18h4.2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case "image":
      return (
        <svg {...common} fill="none">
          <rect
            x="3.5"
            y="4.5"
            width="17"
            height="15"
            rx="2.4"
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle cx="9" cy="9.6" r="1.6" fill="currentColor" />
          <path
            d="M4.4 17.2l4.4-4.3a1.6 1.6 0 012.3 0l2.3 2.4 1.7-1.6a1.6 1.6 0 012.2 0l2.3 2.2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "video":
      return (
        <svg {...common} fill="none">
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2.6"
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M10.3 9.4l4.6 2.6-4.6 2.6z" fill="currentColor" />
          <path d="M3 8.6h18M3 15.4h18" stroke="currentColor" strokeWidth="1.1" opacity="0.5" />
        </svg>
      );
    case "archive":
      return (
        <svg {...common} fill="none">
          <path
            d="M6 3h7.5L19 8.5V21H6z"
            fill="currentColor"
            fillOpacity="0.22"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M13.5 3v5.5H19" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path
            d="M10.4 4v1.6M11.9 5.6v1.6M10.4 7.2v1.6M11.9 8.8v1.6M10.4 10.4V12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <rect
            x="9.5"
            y="12.6"
            width="3.8"
            height="4.2"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );
  }
}

export function FileTypeIcon({ kind }: { kind: FileKind }) {
  return (
    <span
      className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-primary-foreground ${tileClass[kind]}`}
    >
      <Glyph kind={kind} />
    </span>
  );
}
