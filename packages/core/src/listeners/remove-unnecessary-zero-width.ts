import {
  $getSelection,
  $isDecoratorNode,
  $isLineBreakNode,
  $isRangeSelection,
  $nodesOfType,
  type LexicalEditor,
  TextNode,
} from 'lexical';

import { ZeroWidthIMENode } from '../zero-width-node';
import { type ZeroWidthIMENodeMapRef } from '../zero-width-node-link-map';

/**
 * Registers a listener that will remove unnecessary `ZeroWidthIMENode` after IME composition.
 * @param editor The editor instance.
 * @param zeroWidthNodeLinkMapRef The map to keep track of the zero width nodes and the nodes they are linked to.
 * @returns The unregister function.
 */
export const registerRemoveUnnecessaryZeroWidthListener = (
  editor: LexicalEditor,
  zeroWidthNodeLinkMapRef: ZeroWidthIMENodeMapRef,
): (() => void) => {
  // Check `TextNode` changes AFTER IME composition.
  // `registerNodeTransform` is not triggered before IME is confirmed in almost all browsers.
  // Using `registerNodeTransform` is important to ensure it does not negatively affect the IME composition.
  // This is mentioned in the Lexical Docs.
  // See https://lexical.dev/docs/faq#how-do-i-listen-for-user-text-insertions .
  return editor.registerNodeTransform(TextNode, () => {
    editor.update(() => {
      const zeroWidthNodes = $nodesOfType(ZeroWidthIMENode);

      const unnecessaryZeroWidthNodes = zeroWidthNodes.filter(
        (zeroWidthNode) => {
          const prevSibling = zeroWidthNode.getPreviousSibling();
          const nextSibling = zeroWidthNode.getNextSibling();

          const isAfterDecoratorNode = $isDecoratorNode(prevSibling);
          const isBeforeLineBreakNodeOrEndOfEditor =
            $isLineBreakNode(nextSibling) || nextSibling === null;

          return !isAfterDecoratorNode || !isBeforeLineBreakNodeOrEndOfEditor;
        },
      );

      // Note that in this case, the `DecoratorNode` that is linked to `ZeroWidthIMENode` should not be removed because the reason for removing ZeroWidthIMENode is simply that they are no longer needed.
      // So, the map should update before removing the node to avoid removing `DecoratorNode` that is linked to `ZeroWidthIMENode` while `registerZeroWidthRemoveListener` is triggered.
      unnecessaryZeroWidthNodes.forEach((removedZeroWidthNode) => {
        zeroWidthNodeLinkMapRef.current.delete(removedZeroWidthNode.getKey());
      });

      unnecessaryZeroWidthNodes.forEach((removedZeroWidthNode) => {
        const nextSibling = removedZeroWidthNode.getNextSibling();
        removedZeroWidthNode.remove();

        // Workaround to unexpected selection behavior in Chrome when users start typing Japanese "sokuon" (促音) .
        // When typing "ttu" in Japanese, whole text ("っつ") will be selected unexpectedly.
        const select = $getSelection();
        if (
          $isRangeSelection(select) &&
          !select.isCollapsed() &&
          select.getNodes().length === 1 &&
          select.getNodes().at(0) === nextSibling
        )
          nextSibling?.selectEnd();
      });
    });
  });
};
