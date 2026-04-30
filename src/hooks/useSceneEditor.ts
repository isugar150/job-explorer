import { useCallback, useRef, useState } from 'react';
import type { CareerMapData } from '../types/careerMap';
import { isSceneEditMode, moveSceneNode, serializeSceneData } from '../utils/sceneEditor';

type CopyState = 'idle' | 'copied' | 'failed';

interface UseSceneEditorResult {
  copyState: CopyState;
  editMode: boolean;
  editedNodeCount: number;
  editorJson: string;
  lastEditedNodeId: string | null;
  sceneData: CareerMapData;
  copyEditorJson: () => Promise<void>;
  commitEditorJson: () => void;
  moveEditorNode: (layerId: string, nodeId: string, x: number, y: number) => void;
}

export function useSceneEditor(sourceData: CareerMapData): UseSceneEditorResult {
  const [editMode] = useState(() => isSceneEditMode());
  const [sceneData, setSceneData] = useState(sourceData);
  const sceneDataRef = useRef(sceneData);
  const [editorJson, setEditorJson] = useState(() =>
    editMode ? serializeSceneData(sourceData) : '',
  );
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [lastEditedNodeId, setLastEditedNodeId] = useState<string | null>(null);
  const [editedNodeIds, setEditedNodeIds] = useState<Set<string>>(() => new Set());

  const moveEditorNode = useCallback(
    (layerId: string, nodeId: string, x: number, y: number) => {
      if (!editMode) {
        return;
      }

      setSceneData((current) => {
        const nextData = moveSceneNode(current, layerId, nodeId, x, y);
        sceneDataRef.current = nextData;
        return nextData;
      });
      setCopyState('idle');
      setLastEditedNodeId(nodeId);
      setEditedNodeIds((current) => {
        if (current.has(nodeId)) {
          return current;
        }

        const nextIds = new Set(current);
        nextIds.add(nodeId);
        return nextIds;
      });
    },
    [editMode],
  );

  const commitEditorJson = useCallback(() => {
    if (!editMode) {
      return;
    }

    setEditorJson(serializeSceneData(sceneDataRef.current));
  }, [editMode]);

  const copyEditorJson = useCallback(async () => {
    if (!editMode) {
      return;
    }

    const nextJson = serializeSceneData(sceneDataRef.current);
    setEditorJson(nextJson);

    try {
      await copyText(nextJson);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  }, [editMode]);

  return {
    copyState,
    editMode,
    editedNodeCount: editedNodeIds.size,
    editorJson,
    lastEditedNodeId,
    sceneData: editMode ? sceneData : sourceData,
    copyEditorJson,
    commitEditorJson,
    moveEditorNode,
  };
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();

  const copied = document.execCommand('copy');
  textarea.remove();

  if (!copied) {
    throw new Error('Failed to copy text.');
  }
}
