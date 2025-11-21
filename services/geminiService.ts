import { GoogleGenAI, Type } from "@google/genai";
import { BusinessProfile, Message, CartItem, Product, TeamMember, Ticket, Review, Experiment, Task, Order, Driver, ReturnRequest, Event, InvoiceItem, Customer } from '../types';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const getText = (response: any): string => {
  return response.text || "";
};

export const generateAgentResponse = async (history: Message[], business: BusinessProfile, cart: CartItem[]) => {
  const ai = getAI();
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `You are an AI sales agent for ${business.name}.
Industry: ${business.industry}.
Description: ${business.description}.
Policies: ${business.policies}.
Current Cart: ${JSON.stringify(cart)}.
Products: ${JSON.stringify(business.products.map(p => ({id: p.id, name: p.name, price: p.price, variants: p.variants})))}.

Your goal is to be helpful, answer questions, and sell products.
If the user wants to buy something, help them select options.
If the order is finalized/confirmed by user, output [ORDER_CONFIRMED].
If the user requests a human, output [CALL_HANDOVER].
Keep responses short and suitable for WhatsApp.`;

  const contents = history.map(m => ({
      role: m.role,
      parts: [{ text: m.text || (m.image ? "Image sent" : "Content") }]
  }));

  const response = await ai.models.generateContent({
      model,
      config: { systemInstruction },
      contents,
  });

  return {
      text: response.text || "I'm sorry, I didn't catch that.",
      optOut: false,
      booking: null,
      product: null,
      flowId: undefined,
      buttons: undefined,
      list: undefined,
      file: undefined
  };
};

export const generateOnboardingDetails = async (name: string, industry: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Generate business details for a ${industry} business named "${name}". Return JSON with description, welcomeMessage, policies, knowledgeBase, and 3 sample products (name, price, category).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          welcomeMessage: { type: Type.STRING },
          policies: { type: Type.STRING },
          knowledgeBase: { type: Type.STRING },
          products: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                price: { type: Type.NUMBER },
                category: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const generateMarketingCopy = async (business: BusinessProfile, topic: string, audience: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Write a short, engaging WhatsApp marketing message for ${business.name} (${business.industry}) about "${topic}" targeting "${audience}". Include emojis.`,
  });
  return response.text || "";
};

export const analyzeLead = async (transcript: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Analyze this chat transcript and score the lead (0-100). Summarize their intent.\n\nTranscript:\n${transcript}`,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                leadScore: { type: Type.NUMBER },
                summary: { type: Type.STRING }
            }
        }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const generateSmartReplies = async (history: Message[], business: BusinessProfile) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Based on the conversation history, suggest 3 short replies for the agent. Business: ${business.name}.
    
    History: ${JSON.stringify(history.slice(-3))}`,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        }
    }
  });
  return JSON.parse(response.text || "{ \"suggestions\": [] }");
};

export const generateWidgetGreeting = async (business: BusinessProfile) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a catchy, short greeting for a website chat widget for ${business.name} (${business.industry}).`,
    });
    return response.text || "Hi! How can we help?";
};

export const generateWorkflow = async (business: BusinessProfile, goal: string) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create an automation workflow steps for "${goal}".`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    steps: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: ['delay', 'message', 'tag'] },
                                content: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text || "{ \"steps\": [] }");
};

export const generateTemplate = async (business: BusinessProfile, topic: string, category: string) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a WhatsApp template body for "${topic}". Category: ${category}. Use {{1}}, {{2}} for variables. Keep it concise.`,
    });
    return response.text || "";
};

export const generateTicketSolution = async (ticket: Ticket, business: BusinessProfile) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Draft a polite and professional response to this support ticket.
        Subject: ${ticket.subject}
        Description: ${ticket.description}
        Business Policies: ${business.policies}
        `,
    });
    return response.text || "";
};

export const generateReviewReply = async (review: Review, business: BusinessProfile) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Draft a reply to this customer review. Rating: ${review.rating}/5. Review: "${review.text}". Business: ${business.name}.`,
    });
    return response.text || "";
};

export const simulateExperimentResult = async (experiment: Experiment, business: BusinessProfile) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Simulate the results of an A/B test for "${experiment.name}". 
        Variant A: ${experiment.variantA}. 
        Variant B: ${experiment.variantB}.
        Variable: ${experiment.variable}.
        
        Return JSON with stats.`,
        config: {
             responseMimeType: "application/json",
             responseSchema: {
                 type: Type.OBJECT,
                 properties: {
                     a: { type: Type.OBJECT, properties: { sessions: {type: Type.NUMBER}, conversions: {type: Type.NUMBER}, revenue: {type: Type.NUMBER} } },
                     b: { type: Type.OBJECT, properties: { sessions: {type: Type.NUMBER}, conversions: {type: Type.NUMBER}, revenue: {type: Type.NUMBER} } },
                     winner: { type: Type.STRING },
                     confidence: { type: Type.NUMBER }
                 }
             }
        }
    });
    return JSON.parse(response.text || "{}");
};

export const generateSmartTasks = async (customers: any[], business: BusinessProfile) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 3-5 high priority sales tasks for an agent at ${business.name}.`,
        config: {
             responseMimeType: "application/json",
             responseSchema: {
                 type: Type.OBJECT,
                 properties: {
                     tasks: {
                         type: Type.ARRAY,
                         items: {
                             type: Type.OBJECT,
                             properties: {
                                 title: { type: Type.STRING },
                                 description: { type: Type.STRING },
                                 priority: { type: Type.STRING },
                                 customerId: { type: Type.STRING }
                             }
                         }
                     }
                 }
             }
        }
    });
    return JSON.parse(response.text || "{ \"tasks\": [] }");
};

export const optimizeDeliveryRoute = async (orders: Order[], drivers: Driver[]) => {
     // Simple mock logic as robust TSP is hard for LLM pure JSON output without context of locations
     const assignments = orders.map((o, i) => ({
         orderId: o.id,
         driverId: drivers[i % drivers.length].id
     }));
     return { assignments };
};

export const generateLegalPolicy = async (type: 'privacy' | 'terms', business: BusinessProfile) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a ${type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'} for ${business.name}, in the ${business.industry} industry.`,
    });
    return response.text || "";
};

export const generateImageTags = async (imageUrl: string) => {
    // If it's a real URL, we can't fetch it easily in browser context for base64 conversion if CORS blocks.
    // Assuming for this demo we simulate or expect base64/accessible URL.
    // For the mock, we'll just generate text based on randomness or mock.
    // Ideally, we pass base64 to Gemini.
    // Since we can't easily get base64 from a remote URL in this pure client mock safely:
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 5 descriptive tags for a product image in the ${imageUrl} context.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
        }
    });
    return JSON.parse(response.text || "{ \"tags\": [] }");
};

export const generateBusinessImage = async (prompt: string) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: prompt }]
        },
    });
    // Extract base64 image from response
    let base64 = "";
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                base64 = part.inlineData.data;
                break;
            }
        }
    }
    // Fallback if no image generated (e.g. text only response)
    if (!base64) {
       throw new Error("No image generated");
    }
    return base64;
};

export const generateFlow = async (business: BusinessProfile, goal: string) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a WhatsApp Flow JSON structure for "${goal}".`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    screens: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                components: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            type: { type: Type.STRING, enum: ['Text', 'TextArea', 'Dropdown', 'Checkbox', 'Radio'] },
                                            label: { type: Type.STRING },
                                            required: { type: Type.BOOLEAN },
                                            options: { type: Type.ARRAY, items: { type: Type.STRING } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text || "{ \"screens\": [] }");
};

export const generateLandingCopy = async (business: BusinessProfile) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a bio for a mobile landing page for ${business.name}. Industry: ${business.industry}.`,
    });
    return response.text || "";
};

export const generateAdCopy = async (business: BusinessProfile, product: Product, platform: string) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write ad copy for ${platform} for product: ${product.name}.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    headline: { type: Type.STRING },
                    primaryText: { type: Type.STRING }
                }
            }
        }
    });
    return JSON.parse(response.text || "{}");
};

export const generateCallScript = async (customer: Customer, business: BusinessProfile) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a sales call script for calling ${customer.name}. Business: ${business.name}.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    opening: { type: Type.STRING },
                    pitch: { type: Type.STRING },
                    objectionHandling: { type: Type.STRING }
                }
            }
        }
    });
    return JSON.parse(response.text || "{}");
};

export const generateIVRScript = async (business: BusinessProfile, tone: string) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create an IVR menu script for ${business.name}. Tone: ${tone}.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    greeting: { type: Type.STRING },
                    actions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                key: { type: Type.STRING },
                                label: { type: Type.STRING },
                                action: { type: Type.STRING }
                            }
                        }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text || "{}");
};

export const generateSocialCaption = async (business: BusinessProfile, topic: string, platform: string) => {
     const ai = getAI();
     const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: `Write a social media caption for ${platform} about "${topic}" for ${business.name}.`,
         config: {
             responseMimeType: "application/json",
             responseSchema: {
                 type: Type.OBJECT,
                 properties: {
                     caption: { type: Type.STRING },
                     hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                 }
             }
         }
     });
     return JSON.parse(response.text || "{}");
};

export const analyzeReturnRequest = async (request: ReturnRequest, business: BusinessProfile) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze return request. Reason: "${request.reason}". Policy: ${business.policies}. Recommend action (approve/reject).`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING, enum: ['approve', 'reject'] },
                    reasoning: { type: Type.STRING },
                    confidence: { type: Type.NUMBER }
                }
            }
        }
    });
    return JSON.parse(response.text || "{}");
};

export const generateEventDetails = async (name: string, type: string) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate description and agenda for an event named "${name}". Type: ${type}.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING },
                    agenda: { type: Type.STRING }
                }
            }
        }
    });
    return JSON.parse(response.text || "{}");
};

export const generateStaffSchedule = async (team: TeamMember[], hours: string) => {
     const ai = getAI();
     // Simplified: In real world, we'd pass availability.
     const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: `Generate a staff schedule for these employees: ${team.map(m=>m.name).join(', ')}. Operating hours: ${hours}.`,
         config: {
             responseMimeType: "application/json",
             responseSchema: {
                 type: Type.OBJECT,
                 properties: {
                     shifts: {
                         type: Type.ARRAY,
                         items: {
                             type: Type.OBJECT,
                             properties: {
                                 employeeId: { type: Type.STRING },
                                 startTime: { type: Type.STRING },
                                 endTime: { type: Type.STRING },
                                 role: { type: Type.STRING }
                             }
                         }
                     }
                 }
             }
         }
     });
     
     return JSON.parse(response.text || "{ \"shifts\": [] }");
};

export const extractQuoteDetails = async (input: string) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Extract line items from this text: "${input}".`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                description: { type: Type.STRING },
                                quantity: { type: Type.NUMBER },
                                unitPrice: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            }
        }
    });
    return JSON.parse(response.text || "{ \"items\": [] }");
};

export const generateLegalClauses = async (topic: string, business: BusinessProfile) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Draft a legal clause about "${topic}" for a contract. Business: ${business.name}.`,
    });
    return response.text || "";
};

export const generateGiftCardMessage = async (sender: string, recipient: string, amount: string, businessName: string) => {
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Write a short, warm gift card message from ${sender} to ${recipient} for ${amount} at ${businessName}.`,
    });
    return response.text || "";
};

export const analyzeReceipt = async (imageBase64: string) => {
    const ai = getAI();
    // Note: The input imageBase64 might contain the data prefix.
    const data = imageBase64.split(',')[1] || imageBase64;
    
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: data 
      }
    };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                role: 'user',
                parts: [
                    imagePart,
                    { text: 'Analyze this receipt image. Extract the merchant name, total amount, date, and suggest a category (e.g. Meals, Travel, Office, Software).' }
                ]
            }
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    merchant: { type: Type.STRING },
                    amount: { type: Type.NUMBER },
                    date: { type: Type.STRING, description: "YYYY-MM-DD" },
                    category: { type: Type.STRING }
                }
            }
        }
    });
    return JSON.parse(response.text || "{}");
};
