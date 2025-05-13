// src/pages/Editor.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from "../Components/CodeEditor";
import { MdOutlineContentCopy } from "react-icons/md";
import Footer from "../Components/Footer";
import socket from '../utils/Socket';

const Editor = () => {
  const { roomId, username } = useParams();
  const [code, setCode] = useState('// give code here');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (roomId && username) {
      socket.emit("join-room", { roomId, username });

      socket.on('initial-code', (initialCode) => {
        setCode(initialCode);
      });

      socket.on('code-update', (updatedCode) => {
        setCode(updatedCode);
      });

      socket.on('user-list', (userList) => {
        setUsers(userList);
      });

      return () => {
        socket.off('initial-code');
        socket.off('code-update');
        socket.off('user-list');
      };
    }
  }, [roomId, username]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  if (!roomId || !username) {
    return <div className="text-red-500 p-4">Missing room or username in the URL</div>;
  }

  return (
    <div className="container mx-auto p-4 font-mono bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-white text-center">
        Minimalist Code Editor
      </h1>
      <div className="flex m-10">
        <div className="w-1/4 pr-4 text-gray-400">
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-white font-bold">Room ID: {roomId}</h2>
              <button 
                className="bg-[#21293B] p-1 rounded hover:text-[#a08521] text-sm"
                onClick={copyRoomId}
              >
                <MdOutlineContentCopy />
              </button>
            </div>
          </div>
          <div>
            <h2 className="text-white font-bold mb-2">Users</h2>
            <ul className="space-y-1">
              {users.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-3/4">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-white font-bold">
              Code
              <button 
                className="bg-[#21293B] p-1 rounded text-xl hover:text-[#a08521] text-gray-400 ml-2"
                onClick={() => navigator.clipboard.writeText(code)}
              >
                <MdOutlineContentCopy />
              </button>
            </span>
          </div>
          <CodeEditor code={code} setCode={setCode} roomId={roomId} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Editor;
