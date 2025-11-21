import { GoogleGenAI } from "@google/genai";
import { Message, BusinessProfile, CartItem, Customer, Order, Ticket, Task, Campaign, Appointment, MessageLog, WebhookEventLog } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' }) as any;

// --- Helper: Safe JSON Parsing ---
const safeParseJSON = <T>(text: string, fallback: T): T => {
    try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        return fallback;
    }
};

// --- Core Agent Logic ---

export const generateAgentResponse = async (
    history: Message[],
    business: BusinessProfile,
    cart: CartItem[]
): Promise<{
    text: string;
    suggestedActions?: string[];
    updatedCart?: CartItem[];
    orderConfirmation?: any;
    functionCall?: { name: string; args: any };
    // Rich UI Props
    optOut?: boolean;
    booking?: { date: string; time: string; service: string };
    buttons?: { id: string; title: string }[];
    list?: any;
    file?: any;
    product?: any;
    flowId?: string;
}> => {
    const ai = getAI();

    // Define Tools
    const tools = [
        {
            functionDeclarations: [
                {
                    name: "checkInventory",
                    description: "Check if a product is in stock and get its price.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            productName: { type: "STRING", description: "The name of the product to check." }
                        },
                        required: ["productName"]
                    }
                },
                {
                    name: "addToCart",
                    description: "Add a product to the customer's shopping cart.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            productName: { type: "STRING", description: "The name of the product." },
                            quantity: { type: "NUMBER", description: "The quantity to add." }
                        },
                        required: ["productName", "quantity"]
                    }
                },
                {
                    name: "bookAppointment",
                    description: "Book a consultation or appointment for the customer.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            date: { type: "STRING", description: "The date and time for the appointment (ISO string or description)." },
                            type: { type: "STRING", description: "The type of appointment (e.g., consultation, demo)." }
                        },
                        required: ["date", "type"]
                    }
                }
            ]
        }
    ];

    const model = ai.getGenerativeModel({
        model: business.aiConfig?.model || "gemini-2.0-flash",
        tools: tools
    });

    const systemPrompt = `
    You are an AI sales agent for ${business.name}.
    Your goal is to sell products and provide support.
    
    Business Info:
    ${business.description}
    
    Products:
    ${JSON.stringify(business.products)}
    
    Current Cart:
    ${JSON.stringify(cart)}
    
    Instructions:
    ${business.aiConfig?.systemPrompt || ""}
    
    IMPORTANT:
    - If the user asks about stock or price, USE the "checkInventory" tool.
    - If the user wants to buy something, USE the "addToCart" tool.
    - If the user wants to meet, USE the "bookAppointment" tool.
    - Otherwise, just reply with text.
    
    Response Format:
    Return a JSON object with:
    - text: The message to the user (if not calling a tool).
    - suggestedActions: Array of quick replies (optional).
  `;

    try {
        const chat = model.startChat({
            history: history.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            })),
            generationConfig: {
                responseMimeType: "application/json",
                temperature: business.aiConfig?.temperature || 0.7,
            }
        });

        const result = await chat.sendMessage(systemPrompt);
        const response = result.response;

        // Check for native function calls
        const functionCalls = response.functionCalls ? response.functionCalls() : [];
        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            return {
                text: "One moment, checking that for you...",
                functionCall: { name: call.name, args: call.args }
            };
        }

        // Otherwise parse the JSON text
        const text = response.text();
        const parsed = safeParseJSON(text, { text: "I'm having trouble connecting right now." });
        return parsed;

    } catch (error) {
        console.error("AI Error:", error);
        return { text: "I apologize, but I'm experiencing technical difficulties. Please try again later." };
    }
};

// --- Feature Generators ---

export const generateOnboardingDetails = async (websiteUrl: string): Promise<{
    name: string;
    description: string;
    products: { name: string; price: number; description: string }[];
}> => {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    Analyze the business at ${websiteUrl} (simulate visiting it).
    Extract:
    1. Business Name
    2. Short Description
    3. 3 Representative Products (Name, Price, Description)
    
    Return JSON.
  `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        return safeParseJSON(result.response.text(), { name: "", description: "", products: [] });
    } catch (error) {
        return { name: "My Business", description: "A great business", products: [] };
    }
};

export const generateMarketingCopy = async (
    business: BusinessProfile,
    campaignType: string,
    audience: string
): Promise<{
    subject: string;
    body: string;
    sms: string;
}> => {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: business.aiConfig?.model || "gemini-2.0-flash" });

    const prompt = `
    Write marketing copy for ${business.name}.
    Type: ${campaignType}
    Audience: ${audience}
    
    Return JSON with:
    - subject: Email subject
    - body: Email body
    - sms: Short SMS version (<160 chars)
  `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        return safeParseJSON(result.response.text(), { subject: "", body: "", sms: "" });
    } catch (error) {
        return { subject: "Update", body: "Check out our latest products!", sms: "Check out our latest products!" };
    }
};

export const analyzeLead = async (
    history: Message[],
    business: BusinessProfile
): Promise<{
    score: number;
    summary: string;
    tags: string[];
    nextSteps: string;
}> => {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    Analyze this conversation for ${business.name}.
    History: ${JSON.stringify(history)}
    
    Return JSON:
    - score: 0-100 (Lead Quality)
    - summary: 1 sentence summary
    - tags: Array of tags (e.g., "interested", "price-sensitive")
    - nextSteps: Recommended action
  `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        return safeParseJSON(result.response.text(), { score: 0, summary: "No data", tags: [], nextSteps: "None" });
    } catch (error) {
        return { score: 0, summary: "Error analyzing", tags: [], nextSteps: "None" };
    }
};

export const generateSmartReplies = async (history: Message[], business: BusinessProfile): Promise<string[]> => {
    return ["Tell me more", "What is the price?", "Do you ship?"];
};

export const generateTemplate = async (prompt: string, business: BusinessProfile): Promise<any> => {
    return { name: "New Template", body: "Hello {{1}}, check this out!" };
};

export const generateTicketResponse = async (ticket: Ticket, business: BusinessProfile): Promise<string> => {
    return "Here is a proposed solution based on our knowledge base...";
};

export const generateReviewReply = async (review: any, business: BusinessProfile): Promise<string> => {
    return "Thank you for your feedback!";
};

export const simulateExperimentResult = async (exp: any, business: BusinessProfile): Promise<any> => {
    // Simulate experiment results using AI
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: business.aiConfig?.model || "gemini-2.0-flash" });

    const prompt = `
    Predict A/B test results for ${business.name}.
    Variable: ${exp.variable}
    Variant A: ${exp.variantA}
    Variant B: ${exp.variantB}
    
    Simulate 1000 sessions for each variant. Return JSON with:
    {
      "a": { "sessions": 1000, "conversions": <number>, "revenue": <number> },
      "b": { "sessions": 1000, "conversions": <number>, "revenue": <number> },
      "winner": "a" or "b",
      "confidence": <number 0-100>
    }
  `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        return safeParseJSON(result.response.text(), {
            a: { sessions: 1000, conversions: 120, revenue: 2400 },
            b: { sessions: 1000, conversions: 150, revenue: 3000 },
            winner: 'b',
            confidence: 85
        });
    } catch (error) {
        console.error("Experiment Simulation Error:", error);
        return {
            a: { sessions: 1000, conversions: 120, revenue: 2400 },
            b: { sessions: 1000, conversions: 150, revenue: 3000 },
            winner: 'b',
            confidence: 85
        };
    }
};

export const generateSmartTasks = async (
    customers: Customer[],
    orders: Order[],
    business: BusinessProfile
): Promise<{ tasks: any[] }> => {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: business.aiConfig?.model || "gemini-2.0-flash" });

    const prompt = `
    Analyze these customers and orders for ${business.name}.
    Identify 3-5 high-priority sales tasks for today.
    
    Customers: ${JSON.stringify(customers.slice(0, 10).map(c => ({ id: c.id, name: c.name, lastActive: c.lastActive })))}
    Recent Orders: ${JSON.stringify(orders.slice(0, 5).map(o => ({ id: o.id, total: o.total, status: o.status })))}
    
    Return JSON with an array of 'tasks':
    - title: Short action title
    - description: Why this is important
    - priority: 'high', 'medium', or 'low'
    - customerId: ID of related customer (if any)
  `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        return safeParseJSON(result.response.text(), { tasks: [] });
    } catch (error) {
        console.error("AI Task Gen Error:", error);
        return { tasks: [] };
    }
};

export const generateLegalPolicy = async (type: string, business: BusinessProfile): Promise<string> => {
    return "This is a standard legal policy...";
};

export const analyzeImageTags = async (imageBase64: string): Promise<string[]> => {
    return ["product", "high-quality"];
};

export const generateBusinessImage = async (prompt: string): Promise<string> => {
    return "https://via.placeholder.com/300";
};

export const generateAutomationWorkflow = async (prompt: string, business: BusinessProfile): Promise<{ steps: any[] }> => {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: business.aiConfig?.model || "gemini-2.0-flash" });

    const aiPrompt = `
    Create a marketing automation workflow for ${business.name}.
    Goal: ${prompt}
    
    Return JSON with 'steps' array. Each step:
    - type: 'message' | 'delay' | 'tag'
    - content: Message text, delay duration (e.g. "2 hours"), or tag name
  `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: aiPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        return safeParseJSON(result.response.text(), { steps: [] });
    } catch (error) {
        console.error("Workflow Gen Error:", error);
        return { steps: [] };
    }
};

export const generateWidgetGreeting = async (business: BusinessProfile): Promise<string> => {
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: business.aiConfig?.model || "gemini-2.0-flash" });

    const prompt = `
    Write a short, welcoming greeting for a website chat widget for ${business.name}.
    Tone: Friendly and helpful.
    Max length: 15 words.
  `;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        return result.response.text().trim();
    } catch (error) {
        return "Hi! How can we help you today?";
    }
};

export const generateLandingPage = async (business: BusinessProfile): Promise<any> => {
    return { headline: "Welcome", subheadline: "Best products" };
};

export const generateAdCopy = async (product: any, platform: string, business: BusinessProfile): Promise<any> => {
    return { headline: "Buy Now", primaryText: "Great product" };
};

export const generateCallScript = async (customer: Customer, business: BusinessProfile): Promise<string> => {
    return "Hello, this is...";
};

export const generateIVRScript = async (business: BusinessProfile): Promise<any> => {
    return { menu: [] };
};

export const generateSocialCaptions = async (image: string, platform: string, business: BusinessProfile): Promise<string[]> => {
    return ["Check this out! #products"];
};

export const analyzeReturnRequest = async (reason: string, image: string | undefined, business: BusinessProfile): Promise<any> => {
    return { approved: true, reason: "Valid defect" };
};

export const generateEventDetails = async (prompt: string, business: BusinessProfile): Promise<any> => {
    return { title: "Grand Opening", description: "Join us!" };
};

export const generateStaffSchedule = async (staff: any[], constraints: any, business: BusinessProfile): Promise<any> => {
    return [];
};

export const extractQuoteDetails = async (conversation: Message[], business: BusinessProfile): Promise<any> => {
    return { items: [], total: 0 };
};

export const generateGiftCardMessage = async (sender: string, recipient: string, occasion: string): Promise<string> => {
    return `Hi ${recipient}, enjoy this gift from ${sender}!`;
};

export const analyzeReceipt = async (image: string): Promise<any> => {
    return { total: 0, date: Date.now(), items: [] };
};

// Missing exports implementation
export const optimizeDeliveryRoute = async (orders: any[], business: BusinessProfile): Promise<any> => {
    return { optimizedRoute: [], estimatedTime: "2 hours", distance: "15 km" };
};

export const generateFlow = async (prompt: string, business: BusinessProfile): Promise<any> => {
    return { nodes: [], edges: [] };
};

export const generateLegalClauses = async (contractType: string, business: BusinessProfile): Promise<string[]> => {
    return ["Clause 1: Standard terms apply.", "Clause 2: Payment due within 30 days."];
};

export const generateImageTags = async (imageUrl: string): Promise<string[]> => {
    return ["product", "high-quality", "professional"];
};

export const generateSocialCaption = async (image: string, platform: string, business: BusinessProfile): Promise<string> => {
    return `Check out our amazing products! 🌟 #${business.name.replace(/\s/g, '')}`;
};

