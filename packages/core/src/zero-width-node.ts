/*
 * This section of the code is based on the source code from lexical-beautiful-mentions (https://github.com/sodenn/lexical-beautiful-mentions).
 * The original code is copyrighted by Dennis Soehnen and provided under the MIT License.
 * Below is the full text of the license.
 *
 * MIT License

 * Copyright (c) 2023 Dennis Soehnen
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {
  $applyNodeReplacement,
  type DOMConversionMap,
  type DOMExportOutput,
  type LexicalEditor,
  TextNode,
  type LexicalNode,
  type NodeKey,
  type SerializedTextNode,
} from 'lexical';

/**
 * The character that is used to represent a zero width IME character.
 * Zero Width No-Break Space (U+FEFF) is used.
 */
export const ZERO_WIDTH_IME_CHARACTER = '\uFEFF';

/**
 * The node type of `ZeroWidthIMENode` and `SerializedZeroWidthIMENode`.
 */
export const ZERO_WIDTH_IME_NODE_TYPE = 'zeroWidthIME';

/**
 * Serialized `ZeroWidthIMENode`.
 */
export type SerializedZeroWidthIMENode = SerializedTextNode;

/**
 * A specific lexical node that is handled by `lexical-zero-width-ime` plugin.
 */
export class ZeroWidthIMENode extends TextNode {
  static getType(): string {
    return ZERO_WIDTH_IME_NODE_TYPE;
  }

  static clone(node: ZeroWidthIMENode): ZeroWidthIMENode {
    return new ZeroWidthIMENode(node.__textContent, node.__key);
  }

  static importJSON(node: SerializedZeroWidthIMENode): ZeroWidthIMENode {
    return $createZeroWidthIMENode(node.text);
  }

  constructor(
    private readonly __textContent: string,
    key?: NodeKey,
  ) {
    super(ZERO_WIDTH_IME_CHARACTER, key);
  }

  exportJSON(): SerializedZeroWidthIMENode {
    return {
      ...super.exportJSON(),
      text: this.getTextContent(),
      type: this.getType(),
    };
  }

  updateDOM(): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return null;
  }

  exportDOM(_editor: LexicalEditor): DOMExportOutput {
    return { element: null };
  }

  isTextEntity(): boolean {
    return true;
  }

  getTextContent(): string {
    return this.__textContent;
  }
}

/**
 * Create new `ZeroWidthIMENode`.
 * @param textContent text content of creating `ZeroWidthIMENode`.
 * @returns Created `ZeroWidthIMENode`.
 */
export const $createZeroWidthIMENode = (textContent = ''): ZeroWidthIMENode => {
  const zeroWidthNode = new ZeroWidthIMENode(textContent);

  // Prevents that a space that is inserted by the user is deleted again
  // directly after the input.
  zeroWidthNode.setMode('segmented');

  return $applyNodeReplacement(zeroWidthNode);
};

/**
 * Checks if the given node is a `ZeroWidthIMENode`.
 * @param node A node to check.
 * @returns `true` if given node is `ZeroWidthIMENode`.
 */
export const $isZeroWidthIMENode = (
  node: LexicalNode | null | undefined,
): node is ZeroWidthIMENode => {
  return node instanceof ZeroWidthIMENode;
};
