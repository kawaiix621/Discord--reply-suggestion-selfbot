import React, { useState, useEffect } from 'react';
import { database, ref, onValue, set, remove } from './firebaseConfig';

const MessagesComponent = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Load messages from `processed_messages/`
        const messagesRef = ref(database, 'processed_messages');
        onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            const messagesList = data ? Object.entries(data).map(([id, value]) => ({ id, ...value })) : [];
            setMessages(messagesList);
        });
    }, []);

    const handleSuggestionClick = async (messageId, suggestion) => {
        const selectedMessage = messages.find(msg => msg.id === messageId);

        if (!selectedMessage) return;

        // Create new approved message with selected suggestion
        const approvedMessage = {
            ...selectedMessage,
            response: suggestion,
            timestamp: new Date().toISOString()
        };

        // Write to `approved_messages/`
        await set(ref(database, `approved_messages/${messageId}`), approvedMessage);

        // Remove message from `processed_messages/`
        await remove(ref(database, `processed_messages/${messageId}`));

        // Remove message from local state
        setMessages(messages.filter(msg => msg.id !== messageId));
    };

    return (
        <div>
            <div
             className='heads'
            >
                <h1>
                    Kawaii 🍜
                </h1>

            </div>
            <ul>
                {messages.map((message) => (
                    <div key={message.id}>


<div className='context'>
<p className='Author'>{message.author}</p>
                        <p className='Content'> {message.content}</p>

</div>
                     


                        <div>

                            <div>
                                <button onClick={() => handleSuggestionClick(message.id, message.suggestion_1)}>
                                    {message.suggestion_1}
                                </button>
                                <button onClick={() => handleSuggestionClick(message.id, message.suggestion_2)}>
                                    {message.suggestion_2}
                                </button>
                            </div>


                        </div>
                    </div>
                ))}
            </ul>
        </div>
    );
};

export default MessagesComponent;
