import { useMemo } from 'react';
import type { CareerMapData, ViewportRect } from '../types/careerMap';
import { intersects, rectFromBounds } from '../utils/geometry';

interface FloorLabelLayerProps {
  data: CareerMapData;
  viewportRect: ViewportRect;
}

export function FloorLabelLayer({ data, viewportRect }: FloorLabelLayerProps) {
  const visibleLabels = useMemo(() => {
    return data.stages.flatMap((stage) =>
      stage.floors
        .filter((floor) => intersects(rectFromBounds(stage.x, floor.y, stage.width, floor.height), viewportRect))
        .map((floor) => {
          const floorRooms = stage.rooms.filter((room) => room.floorId === floor.id);
          const firstRoomX = Math.min(...floorRooms.map((room) => room.x));
          const firstRoomY = Math.min(...floorRooms.map((room) => room.y));
          const hasRoom = floorRooms.length > 0;

          return {
            id: floor.id,
            title: `${floor.level} · ${floor.title}`,
            x: hasRoom ? firstRoomX + 48 : stage.x + 72,
            y: hasRoom ? firstRoomY + 18 : floor.y + 26,
          };
        }),
    );
  }, [data.stages, viewportRect]);

  return (
    <div className="floor-label-layer" aria-label="층 라벨">
      {visibleLabels.map((label) => (
        <div
          key={label.id}
          className="floor-label"
          style={{ left: label.x, top: label.y }}
        >
          {label.title}
        </div>
      ))}
    </div>
  );
}
