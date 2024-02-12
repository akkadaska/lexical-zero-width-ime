import {
  $getRoot,
  $isDecoratorNode,
  $nodesOfType,
  type LexicalEditor,
  LineBreakNode,
} from 'lexical';

import { ZeroWidthIMENode, $createZeroWidthIMENode } from '../zero-width-node';
import { type ZeroWidthIMENodeMapRef } from '../zero-width-node-link-map';

/**
 * Registers a listener that will create and remove `ZeroWidthIMENode` when some `DecoratorNode` has some changes.
 * @param editor The editor instance.
 * @param zeroWidthNodeLinkMapRef The map to keep track of the zero width nodes and the nodes they are linked to.
 * @param textContent The text content of the `ZeroWidthIMENode`.
 * @returns The unregister function.
 */
export const registerCreateAndRemoveZeroWidthListener = (
  editor: LexicalEditor,
  zeroWidthNodeLinkMapRef: ZeroWidthIMENodeMapRef,
  textContent: string,
): (() => void) => {
  // Cleanup and reassign `ZeroWidthIMENode` when some `DecoratorNode` has some changes.
  return editor.registerDecoratorListener((_decorators) => {
    editor.update(
      () => {
        const root = $getRoot();

        // STEP 1: Remove `ZeroWidthIMENode` that has no valid link to `DecoratorNode`.
        const zeroWidthNodes = $nodesOfType(ZeroWidthIMENode);

        zeroWidthNodes.forEach((zeroWidthNode) => {
          const zeroWidthNodeKey = zeroWidthNode.getKey();
          const linkedNodeKey =
            zeroWidthNodeLinkMapRef.current.get(zeroWidthNodeKey);

          // Remove `ZeroWidthIMENode` if it is not defined in the map.
          if (linkedNodeKey === undefined) {
            zeroWidthNodeLinkMapRef.current.delete(zeroWidthNodeKey);
            zeroWidthNode.remove();
            return;
          }

          const previousSiblingKey = zeroWidthNode
            .getPreviousSibling()
            ?.getKey();

          // Remove `ZeroWidthIMENode` if the previous sibling is not the linked node.
          if (
            previousSiblingKey === undefined ||
            previousSiblingKey !== linkedNodeKey
          ) {
            zeroWidthNodeLinkMapRef.current.delete(zeroWidthNodeKey);
            zeroWidthNode.remove();
          }
        });

        // STEP 2: Reassign `ZeroWidthIMENode` to the last `DecoratorNode` if exist.
        const last = root.getLastDescendant();

        if ($isDecoratorNode(last)) {
          zeroWidthNodes.forEach((node) => {
            node.remove();
          }); // cleanup
          const zeroWidthNode = $createZeroWidthIMENode(textContent);
          last.insertAfter(zeroWidthNode);
          zeroWidthNodeLinkMapRef.current.set(
            zeroWidthNode.getKey(),
            last.getKey(),
          );
        }

        // STEP 3: Add `ZeroWidthIMENode` before each line break if the previous sibling is `DecoratorNode`.
        $nodesOfType(LineBreakNode).forEach((node) => {
          const prev = node.getPreviousSibling();
          if ($isDecoratorNode(prev)) {
            const zeroWidthNode = $createZeroWidthIMENode(textContent);
            node.insertBefore(zeroWidthNode);
            zeroWidthNodeLinkMapRef.current.set(
              zeroWidthNode.getKey(),
              prev.getKey(),
            );
          }
        });
      },
      // merge with previous history entry to allow undoing
      { tag: 'history-merge' },
    );
  });
};
