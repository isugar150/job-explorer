# 직업 탐색기 이미지 씬 월드

React 19, TypeScript, Vite 기반 전체 화면 SPA입니다. 화면 구조는 This War of Mine처럼 옆에서 보는 2.5D 이미지 씬 월드입니다. 관리자가 JSON scene graph를 조정하면 뷰페이지가 그대로 렌더링되도록 설계했습니다.

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

## 렌더링

`SceneRenderer`가 layer를 zIndex 순서로 렌더링하고, `LayerRenderer`가 각 node를 absolute `<img>`로 배치합니다. interactive job node는 `<button>` 안에 `<img>`를 넣어 접근성과 클릭 처리를 유지합니다.

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
