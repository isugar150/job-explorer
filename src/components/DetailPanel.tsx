import { LuCheck, LuMapPin, LuTag, LuX } from 'react-icons/lu';
import type { CareerJob } from '../types/careerMap';

interface DetailPanelProps {
  job: CareerJob | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DetailPanel({ job, onClose, onConfirm }: DetailPanelProps) {
  if (!job) {
    return null;
  }

  return (
    <aside className="detail-panel" aria-label={`${job.title} 상세 정보`}>
      <button
        className="detail-close"
        type="button"
        aria-label="상세 패널 닫기"
        onClick={onClose}
      >
        <LuX aria-hidden="true" focusable="false" />
      </button>
      <p className="detail-kicker">
        <LuMapPin aria-hidden="true" focusable="false" />
        {job.site} · {job.level}
      </p>
      <h2>{job.title}</h2>
      <p className="detail-description">{job.description}</p>
      <div className="tag-list" aria-label="직업 태그">
        {job.tags.map((tag) => (
          <span key={tag}>
            <LuTag aria-hidden="true" focusable="false" />
            {tag}
          </span>
        ))}
      </div>
      <button className="detail-confirm" type="button" onClick={onConfirm}>
        <LuCheck aria-hidden="true" focusable="false" />
        확인
      </button>
    </aside>
  );
}
