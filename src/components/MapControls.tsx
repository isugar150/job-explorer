interface MapControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function MapControls({ zoom, onZoomIn, onZoomOut, onReset }: MapControlsProps) {
  return (
    <div className="map-controls" aria-label="지도 확대 축소 컨트롤">
      <button type="button" aria-label="확대" onClick={onZoomIn}>
        +
      </button>
      <span aria-label={`현재 확대율 ${Math.round(zoom * 100)}퍼센트`}>
        {Math.round(zoom * 100)}%
      </span>
      <button type="button" aria-label="축소" onClick={onZoomOut}>
        -
      </button>
      <button type="button" onClick={onReset}>
        리셋
      </button>
    </div>
  );
}
