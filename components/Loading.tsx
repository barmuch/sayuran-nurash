export default function Loading() {
  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4" role="status" aria-label="Loading">
        <div className="spinner" aria-hidden="true"></div>
        <div className="text">Loading...</div>
      </div>

      <style jsx>{`
        .spinner {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: conic-gradient(#00ff55 0 25%, transparent 0 50%, #4a80ff 0 75%, transparent 0 100%);
          -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - 6px), #000 0);
          mask: radial-gradient(farthest-side, #0000 calc(100% - 6px), #000 0);
          animation: spin 1.05s linear infinite;
          filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
        }

        @keyframes spin {
          to {
            transform: rotate(1turn);
          }
        }

        .text {
          color: #1f2937;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-size: 13px;
          opacity: 0.9;
          animation: textfade 2s ease-in-out infinite;
        }

        @keyframes textfade {
          0%, 100% {
            opacity: 0.45;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
