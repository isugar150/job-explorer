import { LuClipboard, LuCode } from 'react-icons/lu';

interface EditPanelProps {
  copyState: 'idle' | 'copied' | 'failed';
  editedNodeCount: number;
  json: string;
  lastEditedNodeId: string | null;
  onCopyJson: () => void;
}

export function EditPanel({
  copyState,
  editedNodeCount,
  json,
  lastEditedNodeId,
  onCopyJson,
}: EditPanelProps) {
  return (
    <aside className="edit-panel" aria-label="Scene JSON edit panel">
      <div className="edit-panel-header">
        <p className="edit-kicker">
          <LuCode aria-hidden="true" focusable="false" />
          Edit mode
        </p>
        <button className="edit-copy" type="button" onClick={onCopyJson}>
          <LuClipboard aria-hidden="true" focusable="false" />
          JSON copy
        </button>
      </div>
      <p className="edit-status" aria-live="polite">
        {getStatusText(copyState, editedNodeCount, lastEditedNodeId)}
      </p>
      <textarea
        className="edit-json"
        readOnly
        spellCheck={false}
        value={json}
        aria-label="Edited scene JSON"
      />
    </aside>
  );
}

function getStatusText(
  copyState: EditPanelProps['copyState'],
  editedNodeCount: number,
  lastEditedNodeId: string | null,
): string {
  if (copyState === 'copied') {
    return 'Copied latest JSON.';
  }

  if (copyState === 'failed') {
    return 'Copy failed.';
  }

  if (!lastEditedNodeId) {
    return 'Ready.';
  }

  return `${editedNodeCount} changed, latest: ${lastEditedNodeId}`;
}
