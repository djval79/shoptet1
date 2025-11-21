import React, { useState } from 'react';
import { Icons } from '../constants';

interface HelpCenterProps {
    onClose: () => void;
}

interface HelpTopic {
    id: string;
    title: string;
    category: string;
    content: string;
    icon: keyof typeof Icons;
}

const HELP_TOPICS: HelpTopic[] = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        category: 'Basics',
        icon: 'Zap',
        content: `Welcome to Shoptet! Here's how to get started:

1. **Create Your Business Profile**: Click on Settings and fill in your business details, industry, and description.

2. **Add Products**: Navigate to Inventory and add your product catalog with prices, descriptions, and images.

3. **Configure AI Agent**: Set your sales strategy (friendly, consultative, or aggressive) and customize the AI's behavior.

4. **Connect Twilio**: Add your Twilio credentials in Settings to enable WhatsApp integration.

5. **Test with Simulator**: Use the Chat Simulator to test conversations before going live.

6. **Go Live**: Once tested, your AI agent is ready to handle real customer conversations!`
    },
    {
        id: 'business-setup',
        title: 'Setting Up Your Business',
        category: 'Configuration',
        icon: 'Settings',
        content: `Configure your business profile for optimal AI performance:

**Basic Information**
- Business name and industry
- Description and welcome message
- Language and currency settings

**Sales Strategy**
- **Friendly**: Casual, warm tone for retail/hospitality
- **Consultative**: Professional, solution-focused for B2B
- **Aggressive**: Direct, conversion-focused for high-volume sales

**Policies & Knowledge Base**
- Add return/refund policies
- Include shipping information
- Provide FAQs and common questions

**AI Configuration**
- Customize the AI prompt template
- Set temperature (0.7 recommended)
- Enable/disable specific features`
    },
    {
        id: 'products',
        title: 'Managing Products',
        category: 'Inventory',
        icon: 'Package',
        content: `Add and manage your product catalog:

**Adding Products**
- Name, price, and description
- Product images (URLs or uploads)
- Categories and variants
- Stock status

**Negotiable Pricing**
- Enable price negotiation for specific products
- Set minimum acceptable price
- AI will handle negotiation automatically

**Product Categories**
- Organize products by category
- Makes it easier for customers to browse
- AI can suggest products by category

**Best Practices**
- Use clear, descriptive names
- Include high-quality images
- Write detailed descriptions
- Keep stock status updated`
    },
    {
        id: 'chat-simulator',
        title: 'Using the Chat Simulator',
        category: 'Testing',
        icon: 'MessageSquare',
        content: `Test your AI agent before going live:

**Sandbox Testing**
- Safe environment to test conversations
- No real messages sent
- Unlimited testing

**What to Test**
- Product inquiries and recommendations
- Price negotiations
- Order placement flow
- Policy questions
- Handoff to human agent

**Tips for Testing**
- Try different customer personas
- Test edge cases and unusual requests
- Verify AI follows your policies
- Check tone matches your brand
- Test in different languages if applicable

**Viewing Results**
- All test conversations are saved
- Review AI responses for quality
- Adjust configuration as needed`
    },
    {
        id: 'twilio-setup',
        title: 'Twilio Integration',
        category: 'Integration',
        icon: 'Phone',
        content: `Connect your Twilio account for WhatsApp:

**Getting Twilio Credentials**
1. Sign up at twilio.com
2. Navigate to Console Dashboard
3. Copy your Account SID
4. Copy your Auth Token

**Sandbox vs Production**
- **Sandbox**: Free testing with +1 415 523 8886
- **Production**: Requires approved WhatsApp Business Account

**Webhook Configuration**
- Incoming messages: Automatically configured
- Status callbacks: Track message delivery
- Fallback URL: Backup endpoint

**Troubleshooting**
- Verify credentials are correct
- Check Twilio account is active
- Ensure webhook URLs are accessible
- Review Twilio error logs`
    },
    {
        id: 'analytics',
        title: 'Understanding Analytics',
        category: 'Reporting',
        icon: 'BarChart',
        content: `Track your performance with built-in analytics:

**Key Metrics**
- **Total Revenue**: All-time sales
- **Active Conversations**: Current open chats
- **Conversion Rate**: Chats that result in sales
- **Average Order Value**: Revenue per order

**Charts & Graphs**
- Revenue trends over time
- Conversation volume
- Peak activity hours
- Product performance

**Customer Insights**
- Top customers by revenue
- Customer lifetime value
- Repeat purchase rate
- Geographic distribution

**Using Data**
- Identify best-selling products
- Optimize AI strategy based on results
- Adjust pricing and promotions
- Improve customer experience`
    },
    {
        id: 'keyboard-shortcuts',
        title: 'Keyboard Shortcuts',
        category: 'Tips',
        icon: 'Command',
        content: `Speed up your workflow with keyboard shortcuts:

**Global Shortcuts**
- \`Cmd/Ctrl + K\`: Open command palette
- \`Cmd/Ctrl + ?\`: Open help center
- \`Cmd/Ctrl + B\`: Toggle sidebar
- \`Esc\`: Close modals/dialogs

**Navigation**
- \`G + D\`: Go to Dashboard
- \`G + I\`: Go to Inbox
- \`G + C\`: Go to CRM
- \`G + A\`: Go to Analytics
- \`G + S\`: Go to Settings

**Actions**
- \`N\`: New conversation
- \`/\`: Search
- \`?\`: Show shortcuts

**Chat Simulator**
- \`Enter\`: Send message
- \`Shift + Enter\`: New line
- \`Cmd/Ctrl + L\`: Clear chat`
    },
    {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        category: 'Support',
        icon: 'AlertCircle',
        content: `Common issues and solutions:

**AI Not Responding**
- Check Gemini API key is set correctly
- Verify API key has sufficient quota
- Review error logs in Developer console

**Messages Not Sending**
- Verify Twilio credentials
- Check Twilio account balance
- Ensure phone number is verified
- Review webhook configuration

**Products Not Showing**
- Confirm products are marked "In Stock"
- Check product has valid price
- Verify product category is set

**Performance Issues**
- Clear browser cache
- Disable browser extensions
- Check internet connection
- Try different browser

**Data Not Syncing**
- Refresh the page
- Check browser console for errors
- Verify localStorage is enabled

**Still Need Help?**
Contact support with:
- Description of the issue
- Steps to reproduce
- Browser and OS version
- Screenshots if applicable`
    }
];

const CATEGORIES = ['All', 'Basics', 'Configuration', 'Inventory', 'Testing', 'Integration', 'Reporting', 'Tips', 'Support'];

const HelpCenter: React.FC<HelpCenterProps> = ({ onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);

    const filteredTopics = HELP_TOPICS.filter(topic => {
        const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            topic.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || topic.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Help Center Panel */}
            <div className="fixed inset-y-0 right-0 w-full md:w-[600px] lg:w-[700px] bg-slate-900 border-l border-slate-700 z-[9999] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                                <Icons.HelpCircle />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Help Center</h2>
                                <p className="text-sm text-slate-400">Find answers and get support</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <Icons.X />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <Icons.Search />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search help topics..."
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/30 overflow-x-auto">
                    <div className="flex space-x-2">
                        {CATEGORIES.map(category => (
                            <button
                                key={category}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    setSelectedTopic(null);
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {selectedTopic ? (
                        // Topic Detail View
                        <div className="p-6 animate-in slide-in-from-right duration-200">
                            <button
                                onClick={() => setSelectedTopic(null)}
                                className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors"
                            >
                                <Icons.ChevronLeft />
                                <span className="text-sm font-medium">Back to topics</span>
                            </button>

                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                                    {React.createElement(Icons[selectedTopic.icon])}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">{selectedTopic.title}</h3>
                                    <p className="text-sm text-slate-400">{selectedTopic.category}</p>
                                </div>
                            </div>

                            <div className="prose prose-invert prose-slate max-w-none">
                                {selectedTopic.content.split('\n').map((line, index) => {
                                    if (line.startsWith('**') && line.endsWith('**')) {
                                        return (
                                            <h4 key={index} className="text-lg font-bold text-white mt-6 mb-3">
                                                {line.replace(/\*\*/g, '')}
                                            </h4>
                                        );
                                    } else if (line.startsWith('- **')) {
                                        const [title, ...rest] = line.substring(4).split('**:');
                                        return (
                                            <div key={index} className="mb-2">
                                                <span className="text-blue-400 font-semibold">{title}</span>
                                                <span className="text-slate-300">: {rest.join('')}</span>
                                            </div>
                                        );
                                    } else if (line.startsWith('- ')) {
                                        return (
                                            <li key={index} className="text-slate-300 ml-4 mb-1">
                                                {line.substring(2)}
                                            </li>
                                        );
                                    } else if (line.match(/^\d+\./)) {
                                        return (
                                            <li key={index} className="text-slate-300 ml-4 mb-2">
                                                {line.replace(/^\d+\.\s*/, '')}
                                            </li>
                                        );
                                    } else if (line.startsWith('`') && line.endsWith('`')) {
                                        return (
                                            <code key={index} className="bg-slate-800 px-2 py-1 rounded text-blue-300 text-sm">
                                                {line.replace(/`/g, '')}
                                            </code>
                                        );
                                    } else if (line.trim()) {
                                        return (
                                            <p key={index} className="text-slate-300 mb-3 leading-relaxed">
                                                {line}
                                            </p>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    ) : (
                        // Topics List View
                        <div className="p-6">
                            {filteredTopics.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredTopics.map(topic => {
                                        const IconComponent = Icons[topic.icon];
                                        return (
                                            <button
                                                key={topic.id}
                                                onClick={() => setSelectedTopic(topic)}
                                                className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl transition-all text-left group"
                                            >
                                                <div className="flex items-start space-x-4">
                                                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform flex-shrink-0">
                                                        <IconComponent />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                                                            {topic.title}
                                                        </h4>
                                                        <p className="text-slate-400 text-sm line-clamp-2">
                                                            {topic.content.split('\n')[0]}
                                                        </p>
                                                        <div className="mt-2">
                                                            <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">
                                                                {topic.category}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0">
                                                        <Icons.ChevronRight />
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-600 mx-auto mb-4">
                                        <Icons.Search />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
                                    <p className="text-slate-400 text-sm">
                                        Try adjusting your search or browse by category
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 bg-slate-800/50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                            <span>Need more help? </span>
                            <a href="mailto:support@shoptet.ai" className="text-blue-400 hover:text-blue-300 font-medium">
                                Contact Support
                            </a>
                        </div>
                        <div className="text-xs text-slate-500">
                            Press <kbd className="px-2 py-1 bg-slate-700 rounded text-slate-300">Cmd/Ctrl + ?</kbd> to toggle
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HelpCenter;
