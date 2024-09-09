// This line is necessary for Next.js to ensure the component is rendered on the client side.
"use client";

// Importing necessary components and hooks from Material-UI and Next.js
import { Box, Button, Stack, TextField } from "@mui/material"; // Box and Stack are layout components from Material-UI.
import Image from "next/image"; // Image component from Next.js for optimized image rendering.
import { useState } from "react"; // useState hook for managing state within the functional component.

export default function Home() {
  // State to manage the list of messages between the user and the assistant (Genix).
  // The initial message is from Genix (role: "assistant"), greeting the user.
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am Genix, your AI-powered customer support assistant for the Genesis Centre. How can I help you today?",
    },
  ]);

  // State to manage the current message being typed by the user.
  // It will store the text input value.
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages
  
    setMessage("");
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
  
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const text = decoder.decode(value, { stream: true });
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          return [
            ...prevMessages.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      // Optionally, update the UI to show an error message
    }
  };

  // The main return statement renders the component.
  return (
    // Box is a Material-UI component that acts as a wrapper for the entire chat interface.
    // It uses flexbox to center the chat box horizontally and vertically on the screen.
    <Box
      width={"100vw"} // Full viewport width.
      height={"100vh"} // Full viewport height.
      display={"flex"} // Flexbox for layout.
      flexDirection={"column"} // Vertical column layout.
      justifyContent={"center"} // Centering the content vertically.
      alignItems={"center"} // Centering the content horizontally.
    >
      {/* Stack is another Material-UI component for stacking child components vertically or horizontally. */}
      <Stack
        direction={"column"} // Stacks children in a column direction.
        width={"600px"} // Fixed width of the chat box.
        height={"600px"} // Fixed height of the chat box.
        border={"1px solid black"} // Black border around the chat box.
        p={2} // Padding inside the chat box.
        spacing={2} // Spacing between stacked child components.
      >
        {/* This Stack is for displaying the list of messages, with scrollable overflow to handle many messages. */}
        <Stack
          direction={"column"} // Stacks messages in a column direction.
          spacing={2} // Spacing between each message bubble.
          flexGrow={1} // Allows the stack to grow and fill the available space.
          overflow={"auto"} // Enables scrolling when messages exceed the available space.
          maxHeight={"100%"} // Limits the stack's height to its parent's height (600px).
        >
          {/* This block maps over the messages array and renders each message. */}
          {messages.map((message, index) => (
            <Box
              key={index} // Unique key for each message in the list.
              display={"flex"} // Flexbox layout for each message.
              justifyContent={
                // Align messages based on who sent them.
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              {" "}
              {/* This inner Box is the message bubble itself, with different styles for the assistant and the user. */}
              <Box
                bgcolor={
                  // Background color depends on the role: primary for assistant, secondary for user.
                  message.role === "assistant"
                    ? "primary.main"
                    : "secondary.main"
                }
                color={"white"} // White text color for readability.
                borderRadius={16} // Rounded corners for the message bubble.
                p={3} // Padding inside the message bubble for spacing.
              >
                {" "}
                {/* Render the message content inside the bubble. */}
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={"row"} spacing={2}>
          <TextField
            label="message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}> Send </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
