import React, { useState } from 'react';
import { Icons } from '../constants';

interface TermsModalProps {
    onAccept: () => void;
    onDecline: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onAccept, onDecline }) => {
    const [agreed, setAgreed] = useState(false);

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Icons.Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Terms of Service</h2>
                            <p className="text-blue-100 text-sm">Beta Testing Agreement</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    <div className="space-y-6 text-slate-300">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                            <p className="text-sm text-slate-400">
                                <strong className="text-white">Important:</strong> By using Chat2Close, you agree to the following terms.
                                Please read carefully before proceeding.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Icons.Lock className="w-5 h-5 text-blue-400" />
                                1. Confidentiality
                            </h3>
                            <p className="mb-2">You agree to keep all information about Chat2Close confidential, including:</p>
                            <ul className="list-disc pl-6 space-y-1 text-sm">
                                <li>Features, functionality, and user interface</li>
                                <li>Business logic, algorithms, and technical implementation</li>
                                <li>Any bugs, issues, or vulnerabilities discovered</li>
                                <li>Performance metrics and usage data</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Icons.AlertCircle className="w-5 h-5 text-red-400" />
                                2. Restrictions
                            </h3>
                            <p className="mb-2">You agree <strong className="text-red-400">NOT</strong> to:</p>
                            <ul className="list-disc pl-6 space-y-1 text-sm">
                                <li>Share your access credentials with anyone</li>
                                <li>Take screenshots or recordings without explicit permission</li>
                                <li>Reverse engineer, decompile, or attempt to extract source code</li>
                                <li>Copy, clone, or recreate any part of the system</li>
                                <li>Use the application for commercial purposes</li>
                                <li>Share information publicly on social media or forums</li>
                                <li>Attempt to bypass security measures or access restrictions</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Icons.FileText className="w-5 h-5 text-purple-400" />
                                3. Intellectual Property
                            </h3>
                            <p className="text-sm">
                                All rights, title, and interest in Chat2Close, including all intellectual property rights,
                                remain exclusively with the owner. You gain no ownership, license, or rights through testing.
                                This is proprietary software protected by copyright and trade secret laws.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Icons.MessageSquare className="w-5 h-5 text-green-400" />
                                4. Feedback & Data
                            </h3>
                            <p className="text-sm">
                                Any feedback, suggestions, or ideas you provide become the property of Chat2Close and may
                                be used without compensation or attribution. Usage data and analytics may be collected
                                to improve the product.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Icons.X className="w-5 h-5 text-orange-400" />
                                5. Termination
                            </h3>
                            <p className="text-sm">
                                Your access may be revoked at any time, with or without notice, for any reason including
                                violation of these terms. Upon termination, you must immediately cease all use of the application.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Icons.AlertCircle className="w-5 h-5 text-yellow-400" />
                                6. Disclaimer
                            </h3>
                            <p className="text-sm">
                                This is beta software provided "as is" without warranties. The owner is not liable for any
                                damages arising from your use. You use this application at your own risk.
                            </p>
                        </div>

                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mt-6">
                            <p className="text-xs text-slate-400 text-center">
                                <strong className="text-white">© 2025 Chat2Close. All rights reserved.</strong><br />
                                Proprietary and confidential. Unauthorized use, reproduction, or distribution is strictly prohibited.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-700 p-6 bg-slate-800/50">
                    <div className="flex items-center gap-3 mb-4">
                        <input
                            type="checkbox"
                            id="agree-checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor="agree-checkbox" className="text-sm text-slate-300 cursor-pointer">
                            I have read and agree to the Terms of Service and Beta Testing Agreement
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onDecline}
                            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Icons.X className="w-4 h-4" />
                            Decline
                        </button>
                        <button
                            onClick={onAccept}
                            disabled={!agreed}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            <Icons.Check className="w-4 h-4" />
                            Accept & Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
