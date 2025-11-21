# Shoptet Onboarding Guide

Welcome to **Shoptet** - your AI-powered WhatsApp Business platform! This guide will help you get started quickly and make the most of all the features available.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Setting Up Your Business](#setting-up-your-business)
3. [Product Management](#product-management)
4. [AI Configuration](#ai-configuration)
5. [WhatsApp Integration](#whatsapp-integration)
6. [Testing Your Setup](#testing-your-setup)
7. [Analytics & Monitoring](#analytics--monitoring)
8. [Advanced Features](#advanced-features)
9. [Troubleshooting](#troubleshooting)
10. [Keyboard Shortcuts](#keyboard-shortcuts)

---

## 🚀 Getting Started

### First-Time Setup

When you first log in to Shoptet, you'll see a welcome screen with three options:

1. **Start Tour** - Take a guided tour of all features
2. **Create Business** - Jump directly to business setup
3. **Explore Demo** - Browse with sample data

We recommend starting with the **guided tour** to familiarize yourself with the platform.

### Accessing Help

You can access help anytime by:
- Clicking the **Help** button in the sidebar
- Pressing `Cmd/Ctrl + ?` on your keyboard
- Clicking the help icon in the top navigation bar

---

## 🏢 Setting Up Your Business

### Step 1: Basic Information

1. Navigate to **Settings** from the sidebar
2. Fill in your business details:
   - **Business Name**: Your company or store name
   - **Industry**: Select your business category
   - **Description**: Brief overview of your business
   - **Language**: Primary language for customer communication
   - **Currency**: Your preferred currency symbol

### Step 2: Welcome Message

Craft a welcoming first message for new customers:
- Keep it friendly and on-brand
- Mention your business hours if relevant
- Include a call-to-action (e.g., "How can I help you today?")

**Example**: "Hi! Welcome to CyberPunk Coffee ☕ We're open 24/7. What can I brew for you today?"

### Step 3: Sales Strategy

Choose the AI agent's approach:

- **Friendly**: Casual, warm tone - best for retail, hospitality, consumer brands
- **Consultative**: Professional, solution-focused - ideal for B2B, services, high-ticket items
- **Aggressive**: Direct, conversion-focused - suitable for high-volume sales, promotions

### Step 4: Policies & Knowledge Base

Add important information your AI agent should know:
- Return and refund policies
- Shipping information and delivery times
- Payment methods accepted
- FAQs and common customer questions
- Business hours and holidays

---

## 📦 Product Management

### Adding Products

1. Go to **Inventory** in the sidebar
2. Click **+ Add Product**
3. Fill in product details:
   - **Name**: Clear, descriptive product name
   - **Price**: Regular selling price
   - **Description**: Features, benefits, specifications
   - **Image**: Product photo URL or upload
   - **Category**: Organize products by type
   - **Stock Status**: In stock / Out of stock

### Product Categories

Organize products into categories for easier browsing:
- Drinks
- Food
- Merchandise
- Services
- Bundles

### Negotiable Pricing

Enable price negotiation for specific products:
1. Toggle **Negotiable** when adding/editing a product
2. Set **Minimum Price** - the lowest acceptable price
3. The AI will automatically handle price negotiations within this range

### Best Practices

✅ **DO**:
- Use high-quality product images
- Write detailed, benefit-focused descriptions
- Keep stock status updated
- Use consistent naming conventions
- Add product variants if applicable

❌ **DON'T**:
- Use generic or unclear product names
- Leave descriptions empty
- Forget to update out-of-stock items
- Use broken image links

---

## 🤖 AI Configuration

### AI Model Settings

Navigate to **Settings** → **AI Configuration**:

- **Model**: `gemini-2.5-flash` (recommended for speed and quality)
- **Temperature**: `0.7` (balanced creativity and consistency)
- **Custom Prompt**: Customize the AI's behavior and personality

### Customizing the AI Prompt

The AI prompt template includes placeholders:
- `{{business_name}}` - Your business name
- `{{industry}}` - Your industry
- `{{description}}` - Business description
- `{{policies}}` - Your policies
- `{{knowledge_base}}` - Additional knowledge

**Example Custom Prompt**:
```
You are a helpful AI sales agent for {{business_name}}.
Industry: {{industry}}.
Description: {{description}}.

Guidelines:
- Be friendly and professional
- Ask clarifying questions about product variants
- Suggest complementary products
- If order is confirmed, include [ORDER_CONFIRMED]
- If customer requests human agent, include [CALL_HANDOVER]

Keep responses concise and WhatsApp-friendly.
```

### Special Commands

The AI recognizes special markers:
- `[ORDER_CONFIRMED]` - Triggers order processing
- `[CALL_HANDOVER]` - Transfers to human agent
- `[APPOINTMENT_BOOKED]` - Schedules an appointment

---

## 📱 WhatsApp Integration

### Getting Twilio Credentials

1. Sign up at [twilio.com](https://twilio.com)
2. Navigate to your Console Dashboard
3. Copy your **Account SID**
4. Copy your **Auth Token**

### Sandbox vs Production

**Sandbox** (Testing):
- Free to use
- Number: `+1 415 523 8886`
- Perfect for testing before going live
- Limited to approved test numbers

**Production** (Live):
- Requires WhatsApp Business Account approval
- Your own dedicated phone number
- Unlimited messaging (subject to Twilio rates)
- Full feature access

### Connecting Twilio

1. Go to **Settings** → **Connect**
2. Enter your Twilio credentials:
   - Account SID
   - Auth Token
3. For sandbox testing, use `+1 415 523 8886`
4. Click **Save & Test Connection**

### Webhook Configuration

Webhooks are automatically configured:
- **Incoming Messages**: `https://api.chat2close.ai/v1/webhooks/whatsapp/{business_id}/incoming`
- **Status Callbacks**: `https://api.chat2close.ai/v1/callbacks/status/{business_id}`

---

## 🧪 Testing Your Setup

### Using the Chat Simulator

1. Click **AI Simulator** in the sidebar
2. Choose a test scenario or start fresh
3. Send test messages as a customer would
4. Observe AI responses and behavior

### Test Scenarios

Pre-built scenarios to test:
- **New Customer Onboarding**: First-time user interaction
- **Abandoned Cart Recovery**: Re-engagement flow
- **Support Dispute**: Handling complaints

### What to Test

✅ **Essential Tests**:
- Product inquiries and recommendations
- Adding items to cart
- Price negotiations (if enabled)
- Order placement flow
- Policy questions
- Handoff to human agent
- Out-of-stock product handling

### Reviewing Test Results

All test conversations are saved in the simulator. Review them to:
- Verify AI follows your brand voice
- Check accuracy of product information
- Ensure policies are correctly communicated
- Identify areas for improvement

---

## 📊 Analytics & Monitoring

### Dashboard Overview

The **Dashboard** shows key metrics:
- **Total Revenue**: All-time sales
- **Active Conversations**: Current open chats
- **Sales Strategy Performance**: AI effectiveness
- **Revenue Trends**: 7-day chart
- **Conversation Volume**: Daily activity

### CRM & Customer Data

Navigate to **CRM** to view:
- All customer contacts
- Conversation history
- Total spend per customer
- Lead scores
- Customer tags and segments

### Order Management

View and manage orders in **Orders**:
- Filter by status (New, Processing, Completed)
- Update order status
- View order details and items
- Track revenue per order

### Performance Metrics

Monitor these KPIs:
- **Conversion Rate**: Chats that result in sales
- **Average Order Value**: Revenue per transaction
- **Response Time**: AI speed
- **Customer Satisfaction**: From surveys/reviews

---

## 🎯 Advanced Features

### Automations

Create automated workflows in **Automations**:
- Abandoned cart recovery
- Welcome sequences
- Re-engagement campaigns
- Birthday/anniversary messages

### Broadcast Campaigns

Send bulk messages via **Campaigns**:
1. Create a new campaign
2. Select audience (All customers, Segments, Tags)
3. Write your message
4. Schedule or send immediately
5. Track opens, replies, and conversions

### A/B Testing

Test different approaches in **Experiments**:
- Sales strategy variations
- Message templates
- Pricing strategies
- Product recommendations

### Integrations

Connect third-party tools in **Integrations**:
- **Stripe**: Payment processing
- **Shopify**: E-commerce sync
- **Google Sheets**: Data export
- **Slack**: Team notifications
- **Salesforce/HubSpot**: CRM sync

---

## 🔧 Troubleshooting

### AI Not Responding

**Possible Causes**:
- Missing or invalid Gemini API key
- API quota exceeded
- Network connectivity issues

**Solutions**:
1. Check API key in Settings
2. Verify API key has sufficient quota
3. Review error logs in **Developer** console
4. Try regenerating your API key

### Messages Not Sending

**Possible Causes**:
- Invalid Twilio credentials
- Insufficient Twilio account balance
- Unverified phone number
- Webhook configuration error

**Solutions**:
1. Verify Twilio credentials in Settings
2. Check Twilio account balance
3. Ensure phone number is verified in Twilio
4. Review webhook URLs in Twilio console
5. Check Twilio error logs

### Products Not Showing

**Possible Causes**:
- Product marked as out of stock
- Missing product price
- Product not in any category

**Solutions**:
1. Check product stock status
2. Ensure price is set
3. Assign product to a category
4. Verify product is not archived

### Performance Issues

**Solutions**:
- Clear browser cache and cookies
- Disable browser extensions
- Try a different browser
- Check internet connection speed
- Contact support if issues persist

---

## ⌨️ Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open command palette |
| `Cmd/Ctrl + ?` | Open help center |
| `Cmd/Ctrl + B` | Toggle sidebar |
| `Esc` | Close modals/dialogs |

### Navigation Shortcuts

| Shortcut | Action |
|----------|--------|
| `G + D` | Go to Dashboard |
| `G + I` | Go to Inbox |
| `G + C` | Go to CRM |
| `G + A` | Go to Analytics |
| `G + S` | Go to Settings |

### Action Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | New conversation |
| `/` | Search |
| `?` | Show all shortcuts |

### Chat Simulator Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line |
| `Cmd/Ctrl + L` | Clear chat |

---

## 📞 Getting Additional Help

### In-App Help Center

Access comprehensive help topics:
1. Click **Help** in the sidebar (or press `Cmd/Ctrl + ?`)
2. Search for topics or browse by category
3. View detailed guides and FAQs

### Contact Support

Need personalized assistance?
- **Email**: support@shoptet.ai
- **Live Chat**: Available in the help center
- **Documentation**: [docs.shoptet.ai](https://docs.shoptet.ai)

### Community Resources

- **Video Tutorials**: [youtube.com/shoptet](https://youtube.com/shoptet)
- **Community Forum**: [community.shoptet.ai](https://community.shoptet.ai)
- **Blog**: [blog.shoptet.ai](https://blog.shoptet.ai)

---

## 🎓 Best Practices

### For Best Results

1. **Complete Setup Thoroughly**: Don't skip steps in business configuration
2. **Test Before Going Live**: Use the simulator extensively
3. **Monitor Performance**: Check analytics daily
4. **Iterate and Improve**: Update AI prompts based on real conversations
5. **Keep Products Updated**: Maintain accurate inventory and pricing
6. **Respond to Escalations**: Check for human handoff requests regularly
7. **Train Your AI**: Use the Training feature to improve responses
8. **Backup Regularly**: Export your data periodically

### Security Tips

- Never share your API keys publicly
- Use strong passwords for your account
- Enable two-factor authentication
- Regularly review team member access
- Monitor API usage for anomalies

---

## 🎉 You're Ready!

Congratulations! You now have everything you need to start using Shoptet effectively. Remember:

- **Start with the tour** if you haven't already
- **Test thoroughly** before going live
- **Use the help center** whenever you need assistance
- **Monitor your metrics** to optimize performance

Happy selling! 🚀

---

*Last updated: November 2025*
*Version: 1.0*
