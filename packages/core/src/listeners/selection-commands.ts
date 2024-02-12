import { mergeRegister } from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  KEY_ARROW_LEFT_COMMAND,
  type LexicalEditor,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';

import { $isZeroWidthIMENode } from '../zero-width-node';

/**
 * Registers some commands to handle the selection for `ZeroWidthIMENode`.
 * @param editor The editor instance.
 * @returns The unregister function.
 */
export const registerZeroWidthIMESelectionCommands = (
  editor: LexicalEditor,
): (() => void) => {
  return mergeRegister(
    // Command 1: Avoid positioning the collapsed caret at the beginning of the `ZeroWidthIMENode` and select the ending instead.
    editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection();
        if (
          $isRangeSelection(selection) &&
          selection.isCollapsed() &&
          selection.anchor.offset === 0
        ) {
          const node = selection.getNodes().at(0);
          if ($isZeroWidthIMENode(node)) {
            node.selectEnd();
          }
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    ),

    // Command 2: Avoid positioning the collapsed caret at the beginning of the `ZeroWidthIMENode` and select the previous sibling ending instead when the left arrow key is pressed.
    editor.registerCommand(
      KEY_ARROW_LEFT_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          const node = selection.anchor.getNode();
          if ($isZeroWidthIMENode(node)) {
            const previousSibling = node.getPreviousSibling();
            previousSibling?.selectEnd();
          }
        }
        return false;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
  );
};
