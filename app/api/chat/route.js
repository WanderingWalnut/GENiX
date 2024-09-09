import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt =
  "You are an AI-powered customer support assistant for the Genesis Centre called Genix.\n\n" +
  "The Genesis Centre is a non-profit organization dedicated to enriching the health, wellness, and unity of Northeast Calgary. It is a community hub offering a wide range of services and facilities, including:\n\n" +
  "• Recreational Sports: The Centre provides various sports facilities for community members to engage in physical activities and improve their fitness.\n" +
  "• Event Bookings: The Centre’s versatile spaces are available for booking, accommodating everything from cultural events and social gatherings to business-related activities such as trade shows, conferences, and corporate team building.\n" +
  "• Community Engagement: The Centre caters to the diverse interests of the community, offering programs and activities that foster a sense of belonging and well-being.\n\n" +
  "Genix is here to assist you with:\n" +
  "• Operational Hours: Find out when the Genesis Centre is open.\n" +
  "• Current Drop-In Schedule: Get information about available drop-in activities and times.\n" +
  "• FAQs: Answer common questions about the Centre’s services, booking procedures, and more.\n\n" +
  "Feel free to ask Genix for information or assistance related to the Genesis Centre's offerings and operations.";

export async function POST(req) {
  // We use POST request because we are sending and then retrieving data from the OpenAI API
  const openai = new OpenAI();
  const data = await req.json(); // Retrieve the data from the request

  const completion = await openai.chat.completions.create({
    // Send the user's message to the OpenAI API
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...data, // Add the user's message to the completion
    ],
    model: "gpt-4o-mini",
    stream: true, // Stream the response, streaming allows for large responses to come chunk by chunk
  });

  const stream = new ReadableStream({
    async start(controller) {
      // This function is called when the stream is first started.

      // Create a TextEncoder to convert strings into Uint8Array, which is the format required for the stream.
      const encoder = new TextEncoder();

      try {
        // Loop through the chunks of data as they are being generated.
        for await (const chunk of completion) {
          // Extract the content from the chunk. The path chunk.choices[0]?.delta?.content
          // accesses the text content that is being streamed by the OpenAI API.
          const content = chunk.choices[0]?.delta?.content;

          // If there is content, encode it into a Uint8Array and add it to the stream.
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text); // Enqueue the encoded text into the stream.
          }
        }
      } catch (error) {
        // If an error occurs during the streaming process, report it to the controller.
        controller.error(error);
      } finally {
        // When the stream is complete or if there was an error, close the stream.
        controller.close();
      }
    },
  });

  return new NextResponse(stream)
}
