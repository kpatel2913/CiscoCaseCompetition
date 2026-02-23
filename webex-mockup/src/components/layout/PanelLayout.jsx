export default function PanelLayout({ left, center, right, leftWidth = 280, rightWidth = 280, showRight = false }) {
  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Left panel */}
      <div
        className="flex flex-col flex-shrink-0 overflow-hidden"
        style={{
          width: leftWidth,
          borderRight: '1px solid var(--webex-border)',
          background: 'rgba(7, 32, 46, 0.5)'
        }}
      >
        {left}
      </div>

      {/* Center panel */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {center}
      </div>

      {/* Optional right panel */}
      {showRight && right && (
        <div
          className="flex flex-col flex-shrink-0 overflow-hidden"
          style={{
            width: rightWidth,
            borderLeft: '1px solid var(--webex-border)',
            background: 'rgba(7, 32, 46, 0.5)'
          }}
        >
          {right}
        </div>
      )}
    </div>
  );
}
