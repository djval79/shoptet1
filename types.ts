
export interface Message {
    id: string;
    role: 'user' | 'model' | 'system';
    text: string;
    image?: string; // Base64 string for user uploaded images
    location?: { lat: number; lng: number; address?: string }; // New: Location support
    product?: Product;
    flowId?: string; // New: ID of the flow to render

    // Interactive Elements
    buttons?: { id: string; title: string }[]; // Quick Replies
    list?: {
        title: string;
        buttonText: string;
        sections: { title: string; rows: { id: string; title: string; description?: string }[] }[]
    };
    file?: { name: string; url: string; type: 'pdf' | 'audio' | 'video' }; // Attachments

    // Call Logic
    call?: {
        status: 'missed' | 'completed' | 'voicemail';
        duration?: number; // seconds
    };

    // Template specific structure for rendering
    template?: Template;

    // Social
    reaction?: string; // e.g. "👍", "❤️"

    timestamp: number;
    isTyping?: boolean;
    isSystem?: boolean;
    deliveryType?: 'whatsapp' | 'sms'; // New: Distinguish channel
    status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'queued'; // New: Network status
    errorCode?: number; // Twilio Error Code
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    status: 'lead' | 'negotiating' | 'closed' | 'churned';
    totalSpend: number;
    lastActive: number;
    history: Message[];
    aiPaused: boolean;
    optInStatus: 'opted_in' | 'opted_out' | 'pending';
    mockTranscript?: string;
    leadScore?: number;
    aiSummary?: string;
    tags?: string[]; // New: Customer segmentation tags
    notes?: string; // Agent notes
    assignedTo?: string; // New: Agent ID handling the chat
    source?: 'organic' | 'instagram_ad' | 'facebook_ad' | 'qr_code' | 'referral' | 'website_widget'; // New: Attribution
    storeCredit?: number; // New: Wallet balance
    loyaltyPoints?: number; // New: Loyalty points balance
    activeCampaignId?: string; // New: Attribution tracking
    loyaltyTierId?: string;
}

export interface ProductVariant {
    name: string; // e.g. "Size", "Color"
    options: string[]; // e.g. ["S", "M", "L"]
}

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    image?: string;
    category?: string; // New: Grouping for Menus
    negotiable?: boolean;
    minPrice?: number;
    inStock?: boolean;
    stockLevel?: number; // New: Actual count
    salesVelocity?: number; // New: Units sold per day
    isService?: boolean; // New: Distinguish between physical goods and services
    duration?: number; // Duration in minutes if it is a service
    relatedProductIds?: string[]; // New: Cross-sell links
    variants?: ProductVariant[]; // New: Size, Color, etc.
    billingInterval?: 'week' | 'month' | 'year'; // New: Subscription support
}

export interface CartItem extends Product {
    quantity: number;
    selectedVariants?: Record<string, string>; // { "Size": "M", "Color": "Red" }
}

export interface Appointment {
    id: string;
    customerId: string;
    customerName: string;
    serviceName: string;
    startTime: number;
    duration: number; // mins
    status: 'confirmed' | 'pending' | 'cancelled';
    notes?: string;
}

export interface KnowledgeDoc {
    id: string;
    name: string;
    type: 'text' | 'url' | 'file';
    content: string; // The actual text content or url
    status: 'indexed' | 'processing' | 'error';
    size?: string;
    updatedAt: number;
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    active: boolean;
}

export interface SavedReply {
    id: string;
    shortcut: string; // e.g. "intro"
    text: string;
}

export interface TrainingExample {
    id: string;
    trigger: string; // User input
    badResponse: string; // What AI said originally
    correction: string; // What human wants it to say
    status: 'pending' | 'approved';
    context?: string; // Optional context about the situation
}

export interface ReferralProgram {
    enabled: boolean;
    type: 'fixed' | 'percentage';
    referrerReward: number; // Amount giver gets
    refereeReward: number; // Amount receiver gets
    minSpend: number;
}

export interface Referral {
    id: string;
    referrerName: string;
    refereeName: string;
    status: 'pending' | 'completed' | 'paid';
    amount: number; // Revenue generated
    date: number;
}

export interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minSpend?: number;
    active: boolean;
    usageCount: number;
    description?: string;
}

export interface FlowComponent {
    id: string;
    type: 'Text' | 'TextArea' | 'Dropdown' | 'Checkbox' | 'Radio';
    label: string;
    required: boolean;
    options?: string[]; // For Dropdown/Radio
}

export interface FlowScreen {
    id: string;
    title: string;
    components: FlowComponent[];
}

export interface Flow {
    id: string;
    name: string;
    screens: FlowScreen[];
    triggerKeyword?: string; // e.g. "signup"
}

export interface BusinessHours {
    enabled: boolean;
    timezone: string;
    opensAt: string; // "09:00"
    closesAt: string; // "17:00"
    closedDays: number[]; // 0 = Sunday, 1 = Monday...
}

export interface LandingPageConfig {
    enabled: boolean;
    title: string;
    bio: string;
    theme: 'light' | 'dark' | 'brand';
    featuredProductIds: string[];
    socialLinks: { platform: 'instagram' | 'facebook' | 'website' | 'tiktok'; url: string }[];
    views: number;
    clicks: number;
}

export interface WidgetSettings {
    enabled: boolean;
    color: string;
    position: 'left' | 'right';
    ctaText: string;
    greeting: string;
    icon: 'whatsapp' | 'chat';
    delay: number;
}

export interface TemplateButton {
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    value?: string; // URL or Phone Number
}

export interface Template {
    id: string;
    name: string;
    category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
    language: string;
    status: 'approved' | 'pending' | 'rejected';
    createdAt: number;

    // Rich Media Components
    header?: {
        type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
        content?: string; // Text content or Media URL placeholder
    };
    body: string; // Contains {{1}}, {{2}} variables
    footer?: string;
    buttons?: TemplateButton[];
}

export interface User {
    id: string;
    email: string;
    name: string;
    plan: 'trial' | 'starter' | 'growth' | 'enterprise';
    role?: 'owner' | 'admin' | 'agent';
    avatar?: string;
    preferences?: {
        emailAlerts: boolean;
        smsAlerts: boolean;
        dailyDigest: boolean;
    };
}

export interface AgencySettings {
    name: string;
    primaryColor: string;
    logo?: string;
    plans: {
        starter: SubscriptionPlan;
        growth: SubscriptionPlan;
        enterprise: SubscriptionPlan;
    };
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    currency: string;
    features: string[];
    isPopular?: boolean;
}

export interface WhatsAppSender {
    id: string;
    phoneNumber: string;
    displayName: string;
    qualityRating: 'High' | 'Medium' | 'Low';
    messagingLimit: string; // e.g. "Tier 1 (1k/day)"
    status: 'Connected' | 'Pending' | 'Offline';
}

export interface IVRAction {
    key: string; // '1', '2', etc.
    action: 'forward_agent' | 'forward_mobile' | 'send_whatsapp' | 'voicemail';
    target?: string; // Phone number or Template ID
    label: string; // "Sales", "Support"
}

export interface IVRConfig {
    enabled: boolean;
    greetingText: string;
    voiceGender: 'male' | 'female';
    actions: IVRAction[];
}

export interface SandboxConfig {
    incomingUrl: string;
    statusCallbackUrl: string;
    fallbackUrl?: string;
}

export interface RoutingRule {
    id: string;
    name: string;
    condition: 'contains_keyword' | 'sentiment_is' | 'is_vip' | 'is_new';
    value: string; // e.g. "refund", "negative", "true"
    action: 'assign_agent' | 'add_tag' | 'set_priority';
    target: string; // agentId, tag name, or 'high'
    active: boolean;
}

export interface LoyaltyTier {
    id: string;
    name: string; // e.g. Gold
    minSpend: number; // Lifetime spend
    color: string; // e.g. #FFD700
    benefits: string[];
}

export interface LoyaltyProgram {
    enabled: boolean;
    name: string;
    earningRate: number; // Points per $1
    redemptionRate: number; // Points needed for $1 credit
    tiers: LoyaltyTier[];
}

export interface AIConfig {
    model: 'gemini-2.5-flash' | 'gemini-3-pro-preview';
    temperature: number; // 0.0 - 1.0
    systemPrompt: string; // The raw system instruction override
    customPrompt?: string; // Deprecated or alternative
    enabledTools: {
        fileSearch: boolean;
        codeInterpreter: boolean;
    };
    apiKey?: string; // New: BYOK Support
}

export interface BusinessProfile {
    id: string;
    ownerId?: string; // Link to User
    name: string;
    industry: string;
    description: string;
    welcomeMessage: string;
    products: Product[];
    salesStrategy: 'aggressive' | 'consultative' | 'friendly';
    policies: string;
    knowledgeBase?: string; // Unstructured text
    twilioNumber: string;
    twilioAccountSid?: string;
    twilioAuthToken?: string;
    twilioMessagingServiceSid?: string; // New: Messaging Service
    language?: string;
    currencySymbol?: string;
    lowDataMode?: boolean; // For 3G markets
    smsFallbackEnabled?: boolean; // For outages
    businessHours?: BusinessHours;
    deliveryRadius: number; // km
    landingPage?: LandingPageConfig;
    widgetSettings?: WidgetSettings;
    senders?: WhatsAppSender[];
    metaVerificationStatus?: 'verified' | 'unverified' | 'pending';
    metaBusinessId?: string;
    iceBreakers?: string[]; // New: Conversation Starters
    ivrConfig?: IVRConfig; // New: Interactive Voice Response
    sandboxConfig?: SandboxConfig; // New: Persisted Sandbox Settings

    // AI Brain Configuration
    aiConfig?: AIConfig;

    // Stats
    revenue: number;
    activeChats: number;

    // Integrations
    integrations?: {
        stripe: boolean;
        shopify: boolean;
        slack: boolean;
        hubspot: boolean;
        salesforce: boolean;
        googleSheets: boolean;
    };

    // Modules
    templates?: Template[];
    documents?: KnowledgeDoc[];
    faqs?: FAQ[];
    savedReplies?: SavedReply[]; // New: Quick Replies
    trainingExamples?: TrainingExample[];
    flows?: Flow[];
    promotions?: Coupon[];
    referralProgram?: ReferralProgram;
    loyaltyProgram?: LoyaltyProgram; // New: Loyalty Module
    routingRules?: RoutingRule[]; // New: Chat Routing

    // Settings
    voiceSettings?: {
        rate: number;
        pitch: number;
        gender?: 'male' | 'female';
    };
    subscriptionPlan?: 'starter' | 'growth' | 'enterprise';
}

export interface Campaign {
    id: string;
    name: string;
    status: 'draft' | 'scheduled' | 'active' | 'completed';
    audience: string;
    message: string;
    stats: {
        sent: number;
        read: number;
        replied: number;
        converted: number;
        revenue: number; // New: ROI tracking
    };
    createdAt: number;
}

export interface AutomationStep {
    id: string;
    type: 'delay' | 'message' | 'tag';
    content: string; // "2 hours", "Hello...", "VIP"
}

export interface Automation {
    id: string;
    name: string;
    trigger: 'abandoned_cart' | 'new_customer' | 'order_completed';
    steps: AutomationStep[];
    active: boolean;
    stats: {
        runs: number;
        converted: number;
    };
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'agent';
    status: 'active' | 'invited';
    lastActive: number;
    avatar?: string;
    metrics?: {
        revenue: number;
        chatsClosed: number;
        avgResponseTime: number; // minutes
        csat: number; // 0-5
    };
    achievements?: string[]; // IDs of badges e.g. 'top_closer', 'speed'
}

export interface ActivityLog {
    id: string;
    user: string;
    action: string;
    target: string;
    timestamp: number;
    type: 'info' | 'success' | 'warning' | 'error';
}

export interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    created: number;
    lastUsed: number;
    status: 'active' | 'revoked';
}

export interface Webhook {
    id: string;
    url: string;
    events: ('order.created' | 'message.received' | 'ticket.created' | 'customer.created')[];
    status: 'active' | 'failed';
    lastDelivery?: {
        timestamp: number;
        status: number;
    };
}

export interface MessageLog {
    id: string;
    sid: string;
    to: string;
    from: string;
    body: string;
    status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
    errorCode?: number;
    timestamp: number;
    direction: 'inbound' | 'outbound';
}

export interface WebhookEventLog {
    id: string;
    timestamp: number;
    type: 'inbound_message' | 'status_callback' | 'api_response' | 'outbound_webhook';
    url: string;
    method: 'POST' | 'GET' | 'PUT';
    payload: any;
    statusCode: number;
}

export interface Ticket {
    id: string;
    customerId: string;
    customerName: string;
    subject: string;
    description: string;
    status: 'open' | 'pending' | 'resolved';
    priority: 'low' | 'medium' | 'high';
    createdAt: number;
}

export interface Review {
    id: string;
    customerName: string;
    rating: number; // 1-5
    text: string;
    productName: string;
    timestamp: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    status: 'pending' | 'replied';
}

export interface Experiment {
    id: string;
    name: string;
    variable: 'Sales Strategy' | 'Welcome Message' | 'Pricing Model';
    variantA: string;
    variantB: string;
    status: 'draft' | 'running' | 'completed';
    startDate: number;
    stats: {
        a: { sessions: number, conversions: number, revenue: number };
        b: { sessions: number, conversions: number, revenue: number };
    };
    winner?: 'a' | 'b';
    confidence?: number;
}

export interface SalesDataPoint {
    name: string;
    revenue: number;
    conversations: number;
}

export interface SystemNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: number;
    read: boolean;
    link?: AppView;
}

export interface Transaction {
    id: string;
    type: 'payment' | 'payout' | 'refund' | 'fee';
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    date: number;
    description: string;
    reference?: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'in_progress' | 'done';
    dueDate?: number;
    customerId?: string;
    customerName?: string;
    aiGenerated?: boolean;
}

export interface Driver {
    id: string;
    name: string;
    phone: string;
    status: 'idle' | 'busy' | 'offline';
    activeOrders: number;
    location?: { x: number; y: number }; // 0-100% relative to map
    destination?: { x: number; y: number };
    heading?: number; // degrees
}

export interface Order {
    id: string;
    customerId: string;
    customerName: string;
    items: CartItem[];
    total: number;
    status: 'new' | 'processing' | 'shipped' | 'completed';
    timestamp: number;
    assignedDriverId?: string;
    campaignId?: string; // New: Attribution
}

export interface ComplianceRequest {
    id: string;
    customerName: string;
    customerPhone: string;
    type: 'delete_data' | 'export_data';
    status: 'pending' | 'completed';
    requestDate: number;
}

export interface MediaAsset {
    id: string;
    url: string;
    name: string;
    type: 'image' | 'video' | 'document';
    size: string;
    tags: string[];
    createdAt: number;
    aiGenerated?: boolean;
}

export interface SandboxParticipant {
    id: string;
    phone: string; // e.g. whatsapp:+447...
    joinedAt: number;
    status: 'active' | 'inactive';
}

export interface Ad {
    id: string;
    name: string;
    platform: 'facebook' | 'instagram';
    status: 'active' | 'paused' | 'draft';
    headline: string;
    primaryText: string;
    mediaUrl: string;
    productName?: string;
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    ctr: number;
    createdAt: number;
}

export interface SimulatorScenario {
    id: string;
    name: string;
    description: string;
    initialMessages: Message[];
    initialCart?: CartItem[];
    notes?: string; // Info for the user on what this scenario tests
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface Invoice {
    id: string;
    number: string; // INV-001
    customerId: string;
    customerName: string;
    issueDate: number;
    dueDate: number;
    items: InvoiceItem[];
    notes?: string;
    subtotal: number;
    tax: number;
    total: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    pdfUrl?: string; // Mock URL
}

export interface Supplier {
    id: string;
    name: string;
    contactName: string;
    email: string;
    phone: string;
    leadTime: number; // Days
    rating: number; // 1-5
}

export interface POItem {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
}

export interface PurchaseOrder {
    id: string;
    supplierId: string;
    supplierName: string;
    status: 'draft' | 'ordered' | 'received' | 'cancelled';
    items: POItem[];
    totalCost: number;
    dateCreated: number;
    dateExpected?: number;
    notes?: string;
}

export interface SurveyQuestion {
    id: string;
    text: string;
    type: 'rating' | 'nps' | 'yes_no' | 'text';
}

export interface Survey {
    id: string;
    title: string;
    trigger: 'order_delivered' | 'ticket_resolved' | 'manual';
    questions: SurveyQuestion[];
    active: boolean;
    responseCount: number;
    avgScore?: number;
}

export interface SurveyResponse {
    id: string;
    surveyId: string;
    customerId: string;
    customerName: string;
    answers: Record<string, string | number>; // questionId -> answer
    timestamp: number;
    score?: number; // NPS or Rating
}

export interface Subscription {
    id: string;
    customerId: string;
    customerName: string;
    planName: string;
    price: number;
    interval: 'week' | 'month' | 'year';
    status: 'active' | 'paused' | 'cancelled' | 'past_due';
    nextBillingDate: number;
    startDate: number;
}

export interface SocialPost {
    id: string;
    platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok';
    content: string;
    mediaUrl?: string;
    scheduledTime: number;
    status: 'draft' | 'scheduled' | 'published';
    stats?: {
        likes: number;
        comments: number;
        shares: number;
    };
    hashtags?: string[];
}

export interface Affiliate {
    id: string;
    name: string;
    email: string;
    code: string;
    commissionRate: number; // Percentage (0-100)
    earnings: number;
    status: 'active' | 'pending' | 'suspended';
    clicks: number;
    conversions: number;
    joinedAt: number;
}

export interface ReturnRequest {
    id: string;
    orderId: string;
    customerName: string;
    items: string[]; // Product Names
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'refunded';
    requestedAt: number;
    refundAmount: number;
    aiDecision?: {
        action: 'approve' | 'reject';
        reasoning: string;
        confidence: number;
    };
}

export interface Event {
    id: string;
    name: string;
    description: string;
    startDate: number;
    locationType: 'online' | 'physical';
    location: string; // URL or Address
    capacity: number;
    sold: number;
    price: number;
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    imageUrl?: string;
}

export interface EventTicket {
    id: string;
    eventId: string;
    customerId: string;
    customerName: string;
    status: 'confirmed' | 'checked_in' | 'cancelled';
    purchaseDate: number;
}

export interface Shift {
    id: string;
    employeeId: string;
    employeeName: string;
    startTime: number; // Epoch
    endTime: number; // Epoch
    role: string; // e.g. 'Barista', 'Manager'
    color: string; // e.g. '#3b82f6'
    status: 'published' | 'draft';
    notes?: string;
}

export interface Quote {
    id: string;
    number: string;
    customerId: string;
    customerName: string;
    issueDate: number;
    expiryDate: number;
    items: InvoiceItem[];
    subtotal: number;
    total: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';
    notes?: string;
}

export interface Contract {
    id: string;
    title: string;
    customerId: string;
    customerName: string;
    status: 'draft' | 'sent' | 'signed' | 'rejected';
    value: number;
    content: string; // Rich text or markdown
    createdAt: number;
    signedAt?: number;
    signatureUrl?: string;
}

export interface GiftCard {
    id: string;
    code: string;
    initialBalance: number;
    currentBalance: number;
    recipientName?: string;
    recipientPhone?: string;
    senderName?: string;
    status: 'active' | 'redeemed' | 'expired';
    createdAt: number;
    expiryDate?: number;
    designUrl?: string;
}

export interface Expense {
    id: string;
    merchant: string;
    amount: number;
    currency: string;
    date: number;
    category: string;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    receiptUrl?: string;
    submittedBy: string; // User Name
    notes?: string;
}

export enum AppView {
    DASHBOARD = 'dashboard',
    SIMULATOR = 'simulator',
    ONBOARDING = 'onboarding',
    BILLING = 'billing',
    ANALYTICS = 'analytics',
    CAMPAIGNS = 'campaigns',
    AUTOMATIONS = 'automations',
    SETTINGS = 'settings',
    CRM = 'crm',
    ORDERS = 'orders',
    INBOX = 'inbox',
    INVENTORY = 'inventory',
    CONNECT = 'connect',
    INTEGRATIONS = 'integrations',
    TEAM = 'team',
    TEMPLATES = 'templates',
    KNOWLEDGE = 'knowledge',
    DEVELOPER = 'developer',
    SUPPORT = 'support',
    TRAINING = 'training',
    REVIEWS = 'reviews',
    CALENDAR = 'calendar',
    PROFILE = 'profile',
    EXPERIMENTS = 'experiments',
    FINANCE = 'finance',
    TASKS = 'tasks',
    LOGISTICS = 'logistics',
    LEGAL = 'legal',
    MEDIA = 'media',
    AGENCY = 'agency',
    REFERRALS = 'referrals',
    PROMOTIONS = 'promotions',
    FLOWS = 'flows',
    LANDING = 'landing',
    ADS = 'ads',
    DIALER = 'dialer',
    IVR = 'ivr',
    LOYALTY = 'loyalty',
    INVOICES = 'invoices',
    PROCUREMENT = 'procurement',
    POS = 'pos',
    SURVEYS = 'surveys',
    SUBSCRIPTIONS = 'subscriptions',
    SOCIAL = 'social',
    AFFILIATES = 'affiliates',
    RETURNS = 'returns',
    EVENTS = 'events',
    SCHEDULING = 'scheduling',
    QUOTES = 'quotes',
    CONTRACTS = 'contracts',
    GIFT_CARDS = 'gift_cards',
    EXPENSES = 'expenses'
}
