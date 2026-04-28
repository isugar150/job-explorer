# 직업 탐색기 이미지 씬 월드

React 19, TypeScript, Vite 기반 전체 화면 SPA입니다. 화면 구조는 This War of Mine처럼 옆에서 보는 2.5D 이미지 씬 월드입니다. 관리자가 JSON scene graph를 조정하면 뷰페이지가 그대로 렌더링되도록 설계했습니다. UI 아이콘은 `react-icons`를 사용합니다.

## 실행

```bash
npm install
npm run dev
```

검증:

```bash
npm run build
npm audit --audit-level=high
```

## 핵심 구조

- `assets`: 재사용 가능한 이미지 목록
- `layers`: zIndex와 parallax를 가진 렌더링 레이어
- `nodes`: 실제 화면에 배치되는 이미지 인스턴스
- `stages/floors/rooms`: 검색, 에디터, 의미 연결용 논리 메타데이터
- `jobs`: 상세 패널과 검색에 쓰는 직업 정보

직업 위치는 `jobs`가 아니라 `layers[].nodes[]`의 `interactive: true`, `jobId` node가 결정합니다.
각 stage는 서로 다른 층수와 간격을 가질 수 있습니다. 현재 샘플은 병원 5층, 공항 4구역, 제조 현장 3층, 방송국 4층, 지상 도로 1층 구조입니다.

## 렌더링

`SceneRenderer`가 layer를 zIndex 순서로 렌더링하고, `LayerRenderer`가 각 node를 absolute `<img>`로 배치합니다. interactive job node는 `<button>` 안에 `<img>`를 넣어 접근성과 클릭 처리를 유지합니다.

초기 배율은 50%입니다. 최소 배율은 고정값이 아니라 현재 viewport와 world 크기로 계산하며, world 콘텐츠가 화면을 채우는 지점 아래로는 더 축소되지 않습니다. 별도 배율 패널은 렌더링하지 않고, PC는 휠 확대/축소와 드래그 이동, 모바일은 핀치 확대/축소와 터치 이동을 사용합니다. 직업 선택 시에는 해당 오브젝트로 부드럽게 이동하면서 175%로 확대됩니다. 상세 패널에서 확인하거나 닫으면 선택 전 위치와 배율로 복귀합니다.

## 모듈 구조

- `components/CareerMapPage.tsx`: 페이지 조립만 담당
- `hooks/useCareerMapPage.ts`: 검색, 선택, 상세 패널, 초기 포커스 흐름
- `hooks/useMapNavigation.ts`: 외부에서 쓰는 카메라 API
- `hooks/useCameraAnimation.ts`: zoom/scroll 동시 애니메이션
- `hooks/useViewportGestures.ts`: wheel, drag, pinch 이벤트 연결
- `utils/camera.ts`: zoom clamp, camera bounds, focus 좌표 계산
- `utils/initialFocus.ts`: URL query, JSON initialFocus, world camera 우선순위 계산
- `utils/jobQueryParams.ts`: `?job=` URL 동기화

## 성능

`useVirtualWorld`는 viewport 주변 node만 렌더링합니다.

- scroll listener는 passive
- viewport 갱신은 `requestAnimationFrame`
- render buffer와 preload buffer 분리
- preload는 LRU image cache 사용
- 멀어진 node는 DOM에서 제거

## 확장

새 이미지 추가:

1. `public/assets/world/`에 이미지 추가
2. `assets`에 id/src/width/height 등록
3. 원하는 `layers[].nodes[]`에 `assetId`로 배치

새 직업 추가:

1. `jobs`에 상세 정보 추가
2. `object` layer에 `interactive: true`, `jobId`가 있는 node 추가
3. node의 `x`, `y`, `width`, `height`를 에디터 또는 JSON으로 조정

지상 직업 예시는 `ground-workers` 레이어에 추가되어 있습니다. 도로포장 작업자, 교통안전 유도원, 환경미화원, 배달 라이더, 가로수 관리원, 도로시설 점검원은 `street / GROUND` 메타데이터와 연결된 interactive image node입니다.

## 문서

구현 가이드와 고정 프롬프트는 [AGENTS.md](./AGENTS.md)에 정리되어 있습니다.
