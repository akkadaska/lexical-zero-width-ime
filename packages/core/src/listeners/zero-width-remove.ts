import {
  $getNodeByKey,
  $isTextNode,
  $nodesOfType,
  type LexicalEditor,
} from 'lexical';

import {
  ZeroWidthIMENode,
  ZERO_WIDTH_IME_CHARACTER,
  $createZeroWidthIMENode,
} from '../zero-width-node';
import { type ZeroWidthIMENodeMapRef } from '../zero-width-node-link-map';

/**
 * Registers a listener that will remove the linked `DecoratorNode` when the `ZeroWidthIMENode` is removed.
 * @param editor The editor instance.
 * @param zeroWidthNodeLinkMapRef The map to keep track of the zero width nodes and the nodes they are linked to.
 * @returns The unregister function.
 */
export const registerZeroWidthRemoveListener = (
  editor: LexicalEditor,
  zeroWidthNodeLinkMapRef: ZeroWidthIMENodeMapRef,
): (() => void) => {
  // When `ZeroWidthIMENode` is destroyed, remove the linked `DecoratorNode` if it exists.
  // NOTE: linked `DecoratorNode` may not exist when the `ZeroWidthIMENode` is removed by the `registerRemoveUnnecessaryZeroWidthListener`.
  return editor.registerMutationListener(ZeroWidthIMENode, (mutation) => {
    const isDestroyed = Array.from(mutation.values()).some(
      (nodeMutation) => nodeMutation === 'destroyed',
    );

    if (!isDestroyed) {
      return;
    }

    editor.update(() => {
      const remainingZeroWidthNodesKey = $nodesOfType(ZeroWidthIMENode).map(
        (node) => node.getKey(),
      );

      const destroyedZeroWidthNodesKey = Array.from(
        zeroWidthNodeLinkMapRef.current.keys(),
      ).filter((key) => !remainingZeroWidthNodesKey.includes(key));

      destroyedZeroWidthNodesKey.forEach((removedZeroWidthNodeKey) => {
        const shouldRemovedNodeKey = zeroWidthNodeLinkMapRef.current.get(
          removedZeroWidthNodeKey,
        );

        if (shouldRemovedNodeKey === undefined) {
          return;
        }

        const shouldRemovedNode = $getNodeByKey(shouldRemovedNodeKey);

        if (shouldRemovedNode === null) {
          return;
        }

        const nextSibling = shouldRemovedNode.getNextSibling();

        // In some cases, the `ZeroWidthIMENode` may merge with the next `TextNode` and the `ZeroWidthIMENode` is removed before the `registerRemoveUnnecessaryZeroWidthListener` is triggered.
        // At least, Safari on MacOS has this behavior.
        // In this case, the linked `DecoratorNode` should not be removed while this linkage should be removed because it is no longer valid.
        if (
          $isTextNode(nextSibling) &&
          nextSibling.getTextContent().startsWith(ZERO_WIDTH_IME_CHARACTER)
        ) {
          zeroWidthNodeLinkMapRef.current.delete(removedZeroWidthNodeKey);

          // This is a workaround for the issue where the leading letter is duplicated when using IME in Safari on MacOS.
          const newTextNode = $createZeroWidthIMENode('');
          nextSibling.insertAfter(newTextNode);
          newTextNode.selectEnd();
          nextSibling.remove();
          return;
        }

        shouldRemovedNode.remove();
        zeroWidthNodeLinkMapRef.current.delete(removedZeroWidthNodeKey);
      });
    });
  });
};
