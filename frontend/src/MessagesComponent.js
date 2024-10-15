import React, { useState, useEffect } from 'react'; 
import { database, ref, onValue, set, remove } from './firebaseConfig';

const MessagesComponent = () => {
    const [messages, setMessages] = useState([]);
    const [sentMessagesCount, setSentMessagesCount] = useState(0); // State for sent messages count
    const [editingMessage, setEditingMessage] = useState(null); // Track message being edited
    const [editedResponse, setEditedResponse] = useState(''); // Track the input value

    useEffect(() => {
        // Load messages from `processed_messages/`
        const messagesRef = ref(database, 'processed_messages');
        onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            const messagesList = data
                ? Object.entries(data).map(([id, value]) => ({ id, ...value }))
                : [];
            setMessages(messagesList);
        });
        
        // Load count of sent messages from `sent_messages/`
        const sentMessagesRef = ref(database, 'sent_messages');
        onValue(sentMessagesRef, (snapshot) => {
            const sentData = snapshot.val();
            const sentMessagesList = sentData ? Object.entries(sentData).length : 0; // Count the sent messages
            setSentMessagesCount(sentMessagesList); // Set the count in state
        });
    }, []);

    const handleSuggestionClick = async (messageId, suggestion) => {
        const selectedMessage = messages.find(msg => msg.id === messageId);

        if (!selectedMessage) return;

        const approvedMessage = {
            ...selectedMessage,
            response: suggestion,
            timestamp: new Date().toISOString(),
        };

        await set(ref(database, `approved_messages/${messageId}`), approvedMessage);
        await remove(ref(database, `processed_messages/${messageId}`));

        setMessages(messages.filter(msg => msg.id !== messageId));
    };

    const handleDelete = async (messageId) => {
        await remove(ref(database, `processed_messages/${messageId}`));
        setMessages(messages.filter(msg => msg.id !== messageId));
    };

    const handleEdit = (message) => {
        setEditingMessage(message); // Open the edit pop-up
        setEditedResponse(''); // Reset the input field
    };

    const handleSendEditedResponse = async () => {
        if (!editingMessage || !editedResponse) return;

        const approvedMessage = {
            ...editingMessage,
            response: editedResponse,
            timestamp: new Date().toISOString(),
        };

        await set(ref(database, `approved_messages/${editingMessage.id}`), approvedMessage);
        await remove(ref(database, `processed_messages/${editingMessage.id}`));

        setMessages(messages.filter(msg => msg.id !== editingMessage.id));
        setEditingMessage(null); // Close the pop-up
    };

    return (
        <div>
            <div className="heads">
                {/* Display the count of sent messages */}
                <h3>😿Discord: {sentMessagesCount} messages🍜</h3>
            </div>
            <ul>
                {messages.map((message) => (
                    <div key={message.id}>
                        <div className="context">
                            <p className="Author">{message.author}</p>
                            <p className="Content">{message.content}</p>
                        </div>
                        <div>
                            <button onClick={() => handleSuggestionClick(message.id, message.suggestion_1)}>
                                {message.suggestion_1}
                            </button>
                            <button onClick={() => handleSuggestionClick(message.id, message.suggestion_2)}>
                                {message.suggestion_2}
                            </button>
                            <button onClick={() => handleEdit(message)}>Edit</button>
                            <button className='delete' onClick={() => handleDelete(message.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </ul>

            {/* Edit Pop-up */}
            {editingMessage && (
                <div className="popup">
                    <input
                        type="text"
                        value={editedResponse}
                        onChange={(e) => setEditedResponse(e.target.value)}
                        placeholder="Type your response..."
                    />
                    <div style={{ textAlign: 'right' }}>
                        <button className='send' onClick={handleSendEditedResponse}>Send</button>
                        <button className='cancel' onClick={() => setEditingMessage(null)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesComponent;
