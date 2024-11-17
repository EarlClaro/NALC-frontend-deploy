/* eslint-disable jsx-a11y/no-redundant-roles */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faRobot, faUser, faPen, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import UserOption from '../../Components/UserOption';
import HomePage from '../../Components/HomePage';
import { useNavigate } from 'react-router-dom';
import { ripples, dotWave, quantum } from 'ldrs';

function Home() {
  ripples.register();
  dotWave.register();
  quantum.register();

  const [input, setInput] = useState('');
  const [chatName, setChatName] = useState('');
  const [chats, setChats] = useState([]);
  const [threadId, setThreadId] = useState(0);
  const [chatMsg, setChatMsg] = useState([]);
  const reversedChats = chats.slice().reverse();
  const [editModes, setEditModes] = useState(Array(reversedChats.length).fill(false));
  const [tempName, setTempName] = useState('');
  const [selectedThread, setSelectedThread] = useState('');
  const [msgloading, setmsgloading] = useState(false);
  const [chatCreated, setChatCreated] = useState(false);
  const [userData, setUserData] = useState([]);
  const [showHome, setShowHome] = useState(true);
  const navigate = useNavigate();
  const [threadLoading, setThreadLoading] = useState(false);
  const [convoLoading, setConvoLoading] = useState(false);
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(null);

  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    // Ensure the token is added to the Axios headers
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        console.error('No token found');
    }

    // Now fetch user data and chats
    const fetchData = async () => {
        try {
            await fetchUserData();
            await fetchChats();
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    fetchData();
}, []);
  
  // Set up Axios defaults
  axios.defaults.baseURL = 'http://167.172.68.108:8000/';
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // Handle unauthorized errors and session timeout
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        redirectToLogin();  // Redirect to login if token is invalid
      }
      return Promise.reject(error);
    }
  );

  // Handle unauthorized errors and session timeout
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        redirectToLogin();
      }
      return Promise.reject(error);
    }
  );

  const sessionTimeoutDuration = 30 * 60 * 1000; // 30 minutes in milliseconds
  let sessionTimeout;

  const redirectToLogin = () => {
    window.location.href = '/';
  };

  const resetSessionTimeout = () => {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(redirectToLogin, sessionTimeoutDuration);
  };

  useEffect(() => {
    resetSessionTimeout();
    document.addEventListener('mousemove', resetSessionTimeout);
    document.addEventListener('keydown', resetSessionTimeout);

    return () => {
      document.removeEventListener('mousemove', resetSessionTimeout);
      document.removeEventListener('keydown', resetSessionTimeout);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    redirectToLogin();
  };

  const handleInputChange = (identifier) => (e) => {
    if (identifier === "input") {
      setInput(e.target.value);
    } else if (identifier === "chat") {
      setChatName(e.target.value);
    }
  };

  // Example for fetching user data
const fetchUserData = async () => {
  try {
    const response = await axios.get('http://167.172.68.108:8000/api/users/details/', {
      headers: {
        'Authorization': `Bearer ${token}` // Include the token in the request headers
      }
    });
    setUserData(response.data);
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

// Example for fetching threads
const fetchChatsAndData = async () => {
  try {
    const response = await axios.get('http://167.172.68.108:8000/api/users/threads/', {
      headers: {
        'Authorization': `Bearer ${token}` // Include the token in the request headers
      }
    });
    setChats(response.data);
  } catch (error) {
    console.error('Error fetching chats:', error);
  }
};

  const fetchChats = async () => {
    await fetchChatsAndData();
  };

  const fetchDataAndMsg = async (id) => {
    try {
      const responseThread = await axios.get(`api/threads/${id}/`);
      const responseMsg = await axios.get(`api/messages/thread/${id}/`);

      const messages = responseMsg.data.map(message => {
        const messageText = JSON.parse(message.message_text);
        const user = messageText.query;
        let text = messageText.response.replace(/\n/g, '<br>');

        return {
          user,
          text,
        };
      });

      setChatMsg(messages);
      setSelectedThread(responseThread.data.thread_name);
      setThreadId(id);
    } catch (error) {
      console.error('Error fetching thread data and messages:', error);
    } finally {
      setConvoLoading(false);
      setShowHome(false);
    }
  };

  const fetchData = async (id) => {
    try {
      if (reversedChats.length === 0) {
        setThreadLoading(true);
      }
      const response = await axios.get(`api/threads/${id}/`);
      fetchDataAndMsg(id);
    } catch (error) {
      console.error('Error fetching thread data:', error);
    }
  };

  const handleCreateChat = async (name) => {
    try {
      setThreadLoading(true);
      const nameToUse = chatName !== '' ? chatName : name;
      setChatName(nameToUse);
      const response = await axios.post('api/threads/', {
        thread_name: nameToUse,
      });

      const newThreadId = response.data.data.thread_id;

      setChatName('');
      setThreadId(newThreadId);
      setChatCreated(true);

      fetchChats();
      fetchData(newThreadId);
      handleChat(newThreadId);

      return newThreadId;
    } catch (error) {
      alert("Something Went Wrong, Try Again!");
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  const handleChat = async (id) => {
    try {
      setChatCreated(true);
      setSelectedThread("");
      setShowHome(true);
      setConvoLoading(true);
      fetchData(id);
    } catch (error) {
      console.error('Error handling chat:', error);
    }
  };

  const handleEditChat = async (id, index) => {
    try {
      await axios.put(`api/threads/${id}/`, {
        thread_name: tempName,
      });

      setTempName('');
      const newEditModes = [...editModes];
      newEditModes[index] = false;
      setEditModes(newEditModes);
      fetchDataAndMsg(id);
      fetchChats();
    } catch (error) {
      console.error('Error editing chat:', error);
    }
  };

  const handleDeleteAll = () => {
    try {
      axios.delete('api/threads/delete-all/')
        .then(() => {
          fetchChats();
          setChatMsg([]);
          setShowHome(true);
          setSelectedThread("");
        })
        .catch(error => {
          console.error('Error deleting all chats:', error);
        });
    } catch (error) {
      console.error('Error deleting all chats:', error);
    }
  };

  const handleDeleteChat = async (id) => {
    try {
      await axios.delete(`api/threads/${id}/`);
      fetchChats();
      setChatMsg([]);
      setShowHome(true);
      setSelectedThread("");
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const toggleEditMode = (index, threadName) => {
    const newEditModes = [...editModes];
    newEditModes[index] = !newEditModes[index];
    setTempName(threadName);
    setEditModes(newEditModes);
  };

  useEffect(() => {
    if (threadId) {
      fetchData(threadId);
    }
  }, [threadId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchUserData();
        await fetchChats();
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSendMessage = async () => {
    if (input.trim() === '') {
      // Optional: Handle empty input if needed
      return;
    }
  
    setmsgloading(true);
  
    try {
      let currentThreadId;
  
      if (!chatCreated) {
        currentThreadId = await handleCreateChat("New Chat");
      } else {
        currentThreadId = threadId;
      }
  
      if (currentThreadId !== 0) {
        const response = await axios.post('api/messages/create/', {
          thread_id: currentThreadId,
          query: input,
        });
  
        await fetchDataAndMsg(currentThreadId);
        setInput(''); // Clear the input after sending the message
      }
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 429) {
          // Show modal for daily message limit
          setErrorModal({
            show: true,
            title: "Message Limit Reached",
            message: data.error || "You have reached the daily message limit. Please try again in 24 hours.",
          });
        } else if (status === 404) {
          setErrorModal({
            show: true,
            title: "Thread Not Found",
            message: "Thread not found. Creating a new thread.",
          });
          await handleCreateChat("New Chat");
        } else if (status === 500) {
          setErrorModal({
            show: true,
            title: "Server Error",
            message: "An unexpected server error occurred. Please try again later.",
          });
        } else {
          setErrorModal({
            show: true,
            title: "Unexpected Error",
            message: "An unexpected error occurred. Please try again.",
          });
        }
      } else {
        setErrorModal({
          show: true,
          title: "Unexpected Error",
          message: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setmsgloading(false);
    
    }
  };
  
    
  return (
    <div className="container-fluid gx-0">
      {/* Custom Modal */}
      {errorModal.show && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <span className="close-button" onClick={closeModal}>&times;</span>
            <h2>{errorModal.title}</h2>
            <p>{errorModal.message}</p>
            <button id="alert-ok-btn" onClick={closeModal}>OK</button>
          </div>
        </div>
      )}

      {/* Modal */}
      <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-sm">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="staticBackdropLabel">New Chat</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form class="row g-3 needs-validation">
                <div class="col">
                  <input type="text" class="form-control" id="validationCustom03" value={chatName} placeholder='Chat Name'required onChange={handleInputChange("chat")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateChat();
                        window.location.reload();
                      }}}
                  />
                </div>
                <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onClick={handleCreateChat}>Create</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Side Bar */}
      <div className="chat-sidebar">
        <button type="button" class="btn btn-outline-light newChatBtn" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
            <span style={{ marginLeft: "5px" }}>+ New Chat</span>
        </button>
        <div className='logoutBtn d-grid gap-2 col-2 mx-auto'>
          <UserOption userData={userData} Logout={handleLogout} DeleteAll={handleDeleteAll} navigate={navigate} />
        </div>
        <br/>
        <br/>
        <div style={{ overflowY: 'auto', height: '75%' }}>
          {reversedChats.map((chat, index) => (
            <div key={chat.thread_id} style={{ position: 'relative' }}>
              <button
                className={`btn ${selectedButtonIndex === index ? 'btn-warning' : 'btn-outline-warning'} btn-lg`}
                role="button"
                aria-disabled="true"
                style={{ width: '100%', display: 'block', marginBottom: '10px' }}
                onClick={() => {
                  setSelectedButtonIndex(index);
                  handleChat(chat.thread_id);
                }}
              >
                {editModes[index] ? (
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                  />
                ) : (
                  <span className='span-text'>{chat.thread_name.substring(0, 10)}{chat.thread_name.length > 14 ? '...' : ''}</span>
                )}
              </button>
              {/* Edit */}
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', top: 0, right: 0  }}>
                <button
                  className="btn btn-transparent btn-lg"
                  style={{ marginRight: '8px' }} // Add spacing between buttons
                  onClick={() => (editModes[index] ? handleEditChat(chat.thread_id, index) : toggleEditMode(index, chat.thread_name))}
                >
                  {editModes[index] ? <FontAwesomeIcon icon={faCheck} style={{color: "#541212"}} /> : <FontAwesomeIcon icon={faPen} style={{color: "#541212"}} />}
                </button>
                <button
                  className="btn btn-transparent btn-lg"
                  onClick={() => handleDeleteChat(chat.thread_id)}
                >
                  <FontAwesomeIcon icon={faTrash} style={{color: "#541212",}} />
                </button>
              </div>
            </div>
          ))}
          {
            threadLoading && 
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <l-ripples size="150" speed="2" color="yellow"></l-ripples>
            </div>
          }
          
        </div>
      </div>
      {/* Convo Page */}
      <div className="chat-input">
        <div className='convo'>
          <div className = "convo-message convo-message-container">
            <div className='title'>
              <h2>{selectedThread}</h2>
              {convoLoading && 
                <l-dot-wave
                  size="47"
                  speed="1" 
                  color="yellow" 
                ></l-dot-wave>
              }  
            </div>
            <br/>
            {showHome ? (
              <HomePage />
            ) : (
              chatMsg.map((message, index) => (
                <div key={index} style={{ marginBottom: '10px', padding: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', fontSize: '20px' }}>
                  <div style={{ whiteSpace: 'pre-line' }}>
                    <FontAwesomeIcon icon={faUser} style={{ color: "#000000", marginRight: '5px', textShadow: '1px 1px 1px rgba(0, 0, 0, 0.1)' }} />{' '}
                    <strong>You</strong> {'\n'}
                    {message.user}
                  </div>
                  <br />
                  <FontAwesomeIcon icon={faRobot} style={{ color: "rgb(132, 24, 24)", marginRight: '5px', textShadow: '1px 1px 1px rgba(132, 24, 24, 0.5)' }} />
                  <strong>NALC</strong>
                  {Array.isArray(message.text) ? (
                    message.text.map((paper, i) => (
                      <div key={i} dangerouslySetInnerHTML={{ __html: paper }} />
                    ))
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: message.text }} />
                  )}
                </div>
              ))
            )}
            <div className='inputForm'>
              {msgloading && 
                <div>
                  <l-quantum
                    size="20"
                    speed="1.75" 
                    color="black" 
                  ></l-quantum>
                  <span>Analyzing</span>
                </div>    
              }
              <div className="input-group mb-1">
                  <input type="text" className="form-control" aria-label="Recipient's username" aria-describedby="button-addon2" value={input} onChange={handleInputChange("input")}
                  onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendMessage();
                      }
                  }}/>
                  <button className="btn btn-outline-secondary" type="button" id="button-addon2" onClick={handleSendMessage}>
                      <FontAwesomeIcon icon={faPaperPlane} style={{color: "#841818",}} />
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;