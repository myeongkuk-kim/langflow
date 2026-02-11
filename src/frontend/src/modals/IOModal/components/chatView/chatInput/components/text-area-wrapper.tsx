import { useCallback, useEffect, useRef, useState } from "react";
import { useUtilityStore } from "@/stores/utilityStore";
import { Textarea } from "../../../../../../components/ui/textarea";
import { classNames } from "../../../../../../utils/utils";

const TextAreaWrapper = ({
  checkSendingOk,
  send,
  isBuilding,
  noInput,
  chatValue,
  CHAT_INPUT_PLACEHOLDER,
  CHAT_INPUT_PLACEHOLDER_SEND,
  inputRef,
  files,
  isDragging,
}) => {
  const getPlaceholderText = (
    isDragging: boolean,
    noInput: boolean,
  ): string => {
    if (isDragging) {
      return "Drop here";
    } else if (noInput) {
      return CHAT_INPUT_PLACEHOLDER;
    } else {
      return "Send a message...";
    }
  };

  const fileClass = files.length > 0 ? "!rounded-t-none border-t-0" : "";

  const setChatValueStore = useUtilityStore((state) => state.setChatValueStore);

  const additionalClassNames =
    "form-input block w-full border-0 custom-scroll focus:border-ring rounded-none shadow-none focus:ring-0 p-0 sm:text-sm !bg-transparent";

  // Local value to avoid IME composition being broken by store re-renders
  const [localValue, setLocalValue] = useState(chatValue);
  const isComposingRef = useRef(false);

  // Sync store → local when store changes externally (e.g., cleared after send)
  useEffect(() => {
    if (!isComposingRef.current) {
      setLocalValue(chatValue);
    }
  }, [chatValue]);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (event: React.CompositionEvent<HTMLTextAreaElement>) => {
      isComposingRef.current = false;
      // Flush the final composed value to the store
      setChatValueStore(event.currentTarget.value);
    },
    [setChatValueStore],
  );

  useEffect(() => {
    if (!isBuilding && !noInput) {
      inputRef.current?.focus();
    }
  }, [isBuilding, noInput]);

  return (
    <Textarea
      data-testid="input-chat-playground"
      onKeyDown={(event) => {
        if (!isComposingRef.current && checkSendingOk(event)) {
          event.preventDefault();
          send();
        }
      }}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      rows={1}
      ref={inputRef}
      disabled={isBuilding || noInput}
      style={{
        resize: "none",
        bottom: `${inputRef?.current?.scrollHeight}px`,
        maxHeight: "150px",
        overflow: `${
          inputRef.current && inputRef.current.scrollHeight > 150
            ? "auto"
            : "hidden"
        }`,
      }}
      value={localValue}
      onChange={(event): void => {
        const newValue = event.target.value;
        setLocalValue(newValue);
        if (!isComposingRef.current) {
          setChatValueStore(newValue);
        }
      }}
      className={classNames(fileClass, additionalClassNames)}
      placeholder={getPlaceholderText(isDragging, noInput)}
    />
  );
};

export default TextAreaWrapper;
