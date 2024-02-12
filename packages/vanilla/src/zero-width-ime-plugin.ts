import {
  type LinkedNodeKey,
  type ZeroWidthIMENodeKey,
  registerZeroWidthIMEListenerAndCommand,
} from 'lexical-zero-width-ime';
import { type LexicalEditor } from 'lexical';

/**
 * A Lexical editor plugin for React to fix Safari caret issues and IME conflicts using Zero Width No-Break Space.
 * It is recommended to set `ZERO_WIDTH_IME_CHARACTER` as the textContent argument. However, be aware that it might appear in your editor's getTextContent() output.
 * @param editor The Lexical editor instance.
 * @param textContent A text content of `ZeroWidthIMENode`.
 * @returns The unregister function.
 * @see https://github.com/akkadaska/lexical-zero-width-ime
 * @example
 * import { createEditor } from 'lexical';
 * import {
 *   ZeroWidthIMENode,
 *   ZERO_WIDTH_IME_CHARACTER,
 *   registerZeroWidthIMEPlugin,
 * } from '@lexical-zero-width/vanilla';
 *
 * const config = {
 *   // Your editor initial config
 *   nodes: [ZeroWidthIMENode], // This plugin uses `ZeroWidthIMENode`.
 * };
 *
 * const editor = createEditor(config);
 *
 * // Your editor logic
 *
 * // Enable plugin
 * const unregisterZeroWidthIMEPlugin = registerZeroWidthIMEPlugin(
 *   editor,
 *   ZERO_WIDTH_IME_CHARACTER,
 * );
 *
 * // Remember to cleanup
 * unregisterZeroWidthIMEPlugin();
 *
 */
export const registerZeroWidthIMEPlugin = (
  editor: LexicalEditor,
  textContent?: string,
): (() => void) => {
  const zeroWidthNodeLinkMapRef = {
    current: new Map<ZeroWidthIMENodeKey, LinkedNodeKey>(),
  };
  return registerZeroWidthIMEListenerAndCommand(
    editor,
    zeroWidthNodeLinkMapRef,
    textContent,
  );
};
