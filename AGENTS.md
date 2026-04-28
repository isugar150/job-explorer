# AGENTS.md - Fixed Prompt and Coding Guide

## Fixed Prompt

이 프로젝트의 최종 방향은 **This War of Mine 같은 2.5D side-view image scene world**다.

절대 CSS로 건물, 하늘, 땅, 사람을 직접 그리는 방식으로 돌아가지 않는다. 건물, 하늘, 땅, 방 내부, 사람, 장비, 클릭 오브젝트는 모두 **이미지 asset**으로 구현한다고 가정한다.

관리자는 에디터에서 JSON scene graph를 조절한다. 뷰페이지는 그 JSON을 그대로 렌더링한다.

핵심 원칙:

- View는 JSON scene graph renderer다.
- React 컴포넌트는 병원/공항/제조/방송국 같은 도메인별 UI를 하드코딩하지 않는다.
- 화면에 보이는 모든 월드 오브젝트는 `assets + layers + nodes`로 표현한다.
- `stages/floors/rooms/jobs`는 검색, 상세, 에디터 snapping, 의미 연결을 위한 logical metadata다.
- 실제 화면 위치와 크기는 `layers[].nodes[]`가 결정한다.
- 직업 클릭 위치도 `jobs`가 아니라 `interactive node`가 결정한다.
- 에디터와 뷰페이지는 같은 `SceneRenderer`를 공유해야 한다.

한 문장으로 요약하면:

> 관리자가 JSON에서 이미지 node의 assetId, x, y, width, height, zIndex, parallax, jobId만 조정하면 뷰페이지가 그대로 바뀌어야 한다.

## Product Identity

- 앱 이름: 직업 탐색기 이미지 씬 월드
- UI 레퍼런스 방향: This War of Mine 같은 옆에서 보는 2.5D 건물 단면 월드
- 기술 스택: React 19, TypeScript, Vite, 일반 CSS
- 렌더링 방식: DOM + absolute positioned `<img>`
- UI 아이콘: `react-icons`
- 전체 화면 SPA
- native overflow scroll 기반 좌우/상하 이동
- 선택 시 smooth scroll + zoom + 상세 패널

## Hard Rules

금지:

- top-down map
- 지도 서비스형 UI
- grid map
- CSS만으로 만든 건물/사람/땅/하늘
- stage별 전용 React 컴포넌트
- 병원 전용 렌더러, 공항 전용 렌더러 같은 분기
- 지도 라이브러리
- canvas/game engine 추가
- image generation 기능
- `dangerouslySetInnerHTML`

허용:

- SVG/PNG/WebP/JPG 같은 이미지 asset
- JSON scene graph 기반 absolute 배치
- DOM culling
- LRU image preload cache
- editor overlay용 stage/floor/room metadata

## Current File Structure

```txt
src/
  App.tsx
  main.tsx
  data/
    careerMap.json
    careerMapData.ts
  types/careerMap.ts
  renderer/
    SceneRenderer.tsx
    LayerRenderer.tsx
  components/
    CareerMapPage.tsx
    MapViewport.tsx
    SearchPanel.tsx
    DetailPanel.tsx
  hooks/
    useCareerMapPage.ts
    useCameraAnimation.ts
    useVirtualWorld.ts
    useImageCache.ts
    useMapNavigation.ts
    useViewportGestures.ts
  utils/
    asset.ts
    camera.ts
    gesture.ts
    geometry.ts
    initialFocus.ts
    jobQueryParams.ts
    sceneGraph.ts
    searchJobs.ts
  styles/
    career-map.css
public/
  assets/world/
```

## Scene Graph Data Model

`src/data/careerMap.json` is the source of truth.

Top-level structure:

```ts
interface CareerMapData {
  schemaVersion: number;
  world: WorldInfo;
  assets: SceneAsset[];
  layers: SceneLayer[];
  stages: CareerStage[];
  jobs: CareerJob[];
  initialFocus: {
    jobId?: string;
    x?: number;
    y?: number;
    zoom?: number;
  };
}
```

### Assets

Assets are reusable image definitions.

```ts
interface SceneAsset {
  id: string;
  src: string;
  width: number;
  height: number;
  type: 'image';
  alt?: string;
}
```

Rules:

- Every visible world object must reference an asset with `assetId`.
- Replacing an image should usually change only `assets[].src`.
- Do not encode domain behavior in asset IDs.
- Prefer files under `public/assets/world/`.

### Layers

Layers define z-order and parallax.

```ts
interface SceneLayer {
  id: string;
  kind: 'background' | 'building' | 'floor' | 'object' | 'foreground';
  zIndex: number;
  parallax: number;
  nodes: SceneNode[];
}
```

Recommended layer meaning:

- `background`: sky, mountains, distant city
- `building`: large building cutaway images
- `floor`: room interiors, furniture, equipment, signs
- `object`: people, NPCs, job characters, clickable objects
- `foreground`: ground, street, front silhouettes, atmosphere
- ground-level people should be image nodes in a dedicated object layer such as `ground-workers` with `zIndex` above the ground/foreground layer.

Parallax guidance:

- distant background: `0.15` to `0.4`
- world/building/object: `1`
- foreground: `1.03` to `1.15`

### Nodes

Nodes are the actual rendered image instances.

```ts
interface SceneNode {
  id: string;
  assetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  interactive?: boolean;
  jobId?: string;
  stageId?: string;
  floorId?: string;
  roomId?: string;
  label?: string;
}
```

Rules:

- `x`, `y`, `width`, `height` are absolute world coordinates.
- Do not treat `x`, `y` as stage-relative.
- `interactive: true` plus `jobId` makes a node clickable.
- Job visual position comes from the node, not from `jobs`.
- If an editor moves a job character, it updates the node coordinates.

### Stages, Floors, Rooms

These are logical metadata for search, editor snapping, and semantic grouping. They are not the primary visual source.

- `stages`: hospital, airport, factory, studio
- `floors`: logical building floors
- `rooms`: logical room hit areas or editor guides
- `street` / `GROUND`: logical metadata for people working on the ground or road surface
- Do not assume every stage has the same floor count, height, width, or horizontal gap.
- Job character nodes should be aligned to the visible floor/prop baseline in the image, not only centered inside a room rectangle.

Do not build separate visual room/floor DOM from this metadata unless it is an editor overlay. The view page should render images from nodes.

### Jobs

Jobs contain user-facing information:

- title
- site
- stageId
- floorId
- roomId
- level
- tags
- description

Jobs do not own visual placement. Placement belongs to the interactive scene node.

## Renderer Responsibilities

### `SceneRenderer.tsx`

- Receives filtered scene layers.
- Builds `assetMap` and `jobMap`.
- Sorts layers by `zIndex`.
- Delegates each layer to `LayerRenderer`.

### `LayerRenderer.tsx`

- Renders each `SceneNode`.
- Non-interactive node: absolute `<img>`.
- Interactive job node: absolute `<button>` containing `<img>` and label.
- Applies layer parallax:

```ts
left = node.x + scrollLeft * (1 - layer.parallax)
top = node.y + scrollTop * (1 - layer.parallax)
```

Accessibility rules:

- Interactive node must be `button`.
- Use job title/site/level in `aria-label`.
- Maintain `aria-pressed` for selected job.

## Navigation Rules

`useMapNavigation.ts` owns the public camera/navigation API. Camera math belongs in `utils/camera.ts`, camera animation belongs in `useCameraAnimation.ts`, and page selection/search state belongs in `useCareerMapPage.ts`.

- Default zoom: `0.5`
- Minimum zoom is dynamic: `max(viewportWidth / world.width, viewportHeight / world.height)`.
- Do not allow zooming out past the world content bounds because it exposes empty page background.
- Selected job zoom: `1.75`
- `transform-origin: top left`
- Scrollable space size is `world.width * zoom`, `world.height * zoom`
- Do not render a persistent zoom control panel. Desktop wheel zoom and mobile pinch zoom are the primary zoom controls.
- Job focus must animate zoom and scroll together. Do not jump zoom first and scroll later.
- Before opening a job detail panel, save the current camera state. The detail confirm/close action should return to that saved scroll position and zoom.
- To focus a job, find its interactive node, then focus `node.x + width / 2`, `node.y + height * 0.82`

Initial focus priority:

1. URL query `?job=<id>`
2. `initialFocus.jobId`
3. `initialFocus.x`, `initialFocus.y`
4. `world.initialCamera`
5. world center

## Virtual Rendering Rules

`useVirtualWorld.ts` is mandatory for performance.

- Convert viewport scroll to world coordinates by dividing by zoom.
- Use passive scroll listener.
- Update viewport state in `requestAnimationFrame`.
- Render only nodes intersecting `RENDER_BUFFER`.
- Preload assets for nodes intersecting `PRELOAD_BUFFER`.
- Do not render every node unconditionally.

If the world grows to thousands of nodes, improve culling first. Do not add canvas/WebGL prematurely.

## Image Cache Rules

`useImageCache.ts` provides LRU image preload.

- Preload real asset src values.
- When cache exceeds limit, remove oldest image src reference.
- Keep `loading="lazy"` and `decoding="async"` on rendered images.

## Editor Architecture Target

The admin editor should eventually be built around the same scene graph.

Recommended editor screens:

- Asset library
- Layer list
- Node list
- Canvas editor
- Property panel
- Stage/floor/room metadata panel
- Job binding panel
- Preview using the exact same `SceneRenderer`

Editor actions should update JSON:

- add image node
- drag node
- resize node
- change layer
- change zIndex
- change parallax
- bind node to job
- add ground-level worker nodes above the ground layer
- edit job metadata
- edit logical stage/floor/room metadata
- validate scene schema

The editor must not create view-only code paths.

## CSS Rules

CSS should style:

- viewport shell
- scene node button states
- labels
- panels
- controls

CSS should not create:

- buildings
- people
- sky
- ground
- rooms
- equipment

Those must be image assets.

## Search and Detail Rules

Search targets:

- job title
- site
- level
- tags
- description

Search result click must follow the same path as scene node click:

1. Find job
2. Find interactive node by `jobId`
3. Center camera on node
4. Set zoom to selected-job zoom
5. Open detail panel
6. Update URL query

## Dependency Policy

- Do not add dependencies unless absolutely required.
- No map libraries.
- No game engine.
- No image generation.
- No canvas/WebGL migration unless DOM renderer is measured to be insufficient.
- If a dependency is proposed, justify why React/DOM/CSS cannot solve it.
- `react-icons` is the approved icon dependency for UI controls and metadata indicators. Do not add another icon package without approval.

## Validation Commands

After code changes:

```bash
npm run build
npm audit --audit-level=high
```

Local dev:

```bash
npm run dev
```

Default URL:

```txt
http://localhost:5173
```

## Common Pitfalls

- Putting `x`, `y` back into `jobs` and making that the visual source.
- Rendering floors/rooms visually from metadata instead of image nodes.
- Creating hospital-specific or airport-specific React components.
- Rebuilding scene visuals with CSS gradients instead of image assets.
- Forgetting to update `world.width` when adding a stage far to the right.
- Moving an interactive node without preserving `jobId`.
- Changing search result click behavior separately from scene node click behavior.

## Final Product Standard

The final product must feel like an image-based side-view survival/management scene: layered background, cutaway buildings, rooms, people, equipment, and foreground depth. The user should feel like they are browsing an illustrated world, not a map.
