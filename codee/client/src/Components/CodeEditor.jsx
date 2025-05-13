import PropTypes from 'prop-types';
import Editor from "@monaco-editor/react";
import socket from "../utils/Socket";
import { useEffect } from "react";

const CodeEditor = ({ code, setCode, roomId }) => {
  // Emit code change
  const handleEditorChange = (value) => {
    setCode(value);
    socket.emit("code-change", { roomId, newCode: value });
  };

  // Listen for remote code updates
  useEffect(() => {
    socket.on("code-update", (updatedCode) => {
      setCode(updatedCode);
    });

    return () => {
      socket.off("code-update");
    };
  }, [roomId, setCode]);

  return typeof code === "string" ? (
    <Editor
      height="80vh"
      defaultLanguage="javascript"
      value={code}
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: false },
        fontSize: 16,
        lineNumbers: "on",
        scrollBeyondLastLine: true,
        automaticLayout: true,
      }}
      theme="vs-dark"
    />
  ) : (
    <div className="text-red-500 p-4">Loading code editor...</div>
  );
};

CodeEditor.propTypes = {
  code: PropTypes.string.isRequired,
  setCode: PropTypes.func.isRequired,
  roomId: PropTypes.string.isRequired,
};

export default CodeEditor;
