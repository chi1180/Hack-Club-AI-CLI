import type { MessageObject } from "./chatCompletions.types";

/**
 * @abstract The structure of message content
 */
export interface ContentObject {
  /**
   * @description Message content from user input
   */
  user: {
    type: "input_text";
    text: string;
  };

  /**
   * @description Message content from assistant
   */
  assistant: {
    type: "output_text";
    text: string;
  };
}

/**
 * @abstract The structure of message object that extends basic message object
 */
export interface StructuredMessageObject {
  /**
   * @description Structure of request message
   */
  request: MessageObject["request"] & {
    type: "message";
    content: ContentObject["user"];
  };

  /**
   * @description Structure of response message
   */
  response: MessageObject["response"] & {
    type: "message";

    /**
     * @abstract `role` should be "assistant" in response
     */
    role: "assistant";
    content: ContentObject["assistant"];
  };
}
