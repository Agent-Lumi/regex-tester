// Regex Tester - Real regex testing functionality
// v3.0 - Added pattern history, URL sharing, and replace functionality

const RegexTester = {
    // DOM Elements
    elements: {},
    
    // State
    currentMatches: [],
    matchIndex: 0,
    patternHistory: [],
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadSavedData();
        this.loadPatternHistory();
        this.loadFromURL();
        this.registerServiceWorker();
    },
    
    cacheElements() {
        this.elements = {
            pattern: document.getElementById('pattern'),
            flags: document.getElementById('flags'),
            testString: document.getElementById('testString'),
            testBtn: document.getElementById('testBtn'),
            clearBtn: document.getElementById('clearBtn'),
            copyPatternBtn: document.getElementById('copyPatternBtn'),
            shareBtn: document.getElementById('shareBtn'),
            resultsSection: document.getElementById('resultsSection'),
            matches: document.getElementById('matches'),
            matchStats: document.getElementById('matchStats'),
            explanationSection: document.getElementById('explanationSection'),
            explanation: document.getElementById('explanation'),
            errorDisplay: document.getElementById('errorDisplay'),
            flagTags: document.querySelectorAll('.flag-tag'),
            patternButtons: document.querySelectorAll('.pattern-btn'),
            historySection: document.getElementById('historySection'),
            historyList: document.getElementById('historyList'),
            replaceSection: document.getElementById('replaceSection'),
            replaceInput: document.getElementById('replaceInput'),
            replaceBtn: document.getElementById('replaceBtn'),
            replaceResult: document.getElementById('replaceResult'),
            copyReplaceBtn: document.getElementById('copyReplaceBtn')
        };
    },
    
    bindEvents() {
        // Test button
        this.elements.testBtn?.addEventListener('click', () => this.testRegex());
        
        // Clear button
        this.elements.clearBtn?.addEventListener('click', () => this.clearAll());
        
        // Copy pattern button
        this.elements.copyPatternBtn?.addEventListener('click', () => this.copyPattern());
        
        // Share button
        this.elements.shareBtn?.addEventListener('click', () => this.sharePattern());
        
        // Replace button
        this.elements.replaceBtn?.addEventListener('click', () => this.replaceText());
        
        // Copy replace result
        this.elements.copyReplaceBtn?.addEventListener('click', () => this.copyReplaceResult());
        
        // Flag tags
        this.elements.flagTags.forEach(tag => {
            tag.addEventListener('click', () => this.toggleFlag(tag));
        });
        
        // Quick pattern buttons
        this.elements.patternButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.pattern.value = btn.dataset.pattern;
                this.elements.flags.value = btn.dataset.flags;
                this.updateFlagTags();
                this.addToHistory(btn.dataset.pattern, btn.dataset.flags, 'Quick Pattern');
                this.testRegex();
            });
        });
        
        // Real-time testing on input
        this.elements.pattern?.addEventListener('input', () => {
            this.saveData();
            this.debounceTest();
        });
        
        this.elements.flags?.addEventListener('input', () => {
            this.saveData();
            this.updateFlagTags();
            this.debounceTest();
        });
        
        this.elements.testString?.addEventListener('input', () => {
            this.saveData();
            this.debounceTest();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.testRegex();
                        break;
                    case 'Escape':
                        e.preventDefault();
                        this.clearAll();
                        break;
                    case 's':
                        e.preventDefault();
                        if (window.exportResults) {
                            window.exportResults('json');
                        }
                        break;
                    case 'h':
                        e.preventDefault();
                        this.toggleHistory();
                        break;
                    case 'u':
                        e.preventDefault();
                        this.sharePattern();
                        break;
                }
            }
        });
    },
    
    debounceTest() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.testRegex(), 300);
    },
    
    testRegex() {
        const pattern = this.elements.pattern.value;
        const flags = this.elements.flags.value;
        const testString = this.elements.testString.value;
        
        this.hideError();
        
        if (!pattern) {
            this.showResults(false);
            return;
        }
        
        if (!testString) {
            this.showResults(false);
            return;
        }
        
        try {
            const regex = new RegExp(pattern, flags);
            const matches = this.findMatches(regex, testString);
            this.currentMatches = matches;
            this.displayResults(matches, testString);
            this.generateExplanation(pattern, flags, matches);
            
            // Add to history after successful test
            if (matches.length > 0) {
                this.addToHistory(pattern, flags, testString.substring(0, 50));
            }
            
            this.showToast(`Found ${matches.length} match${matches.length !== 1 ? 'es' : ''}`, 'success');
        } catch (e) {
            this.showError(e.message);
            this.showResults(false);
        }
    },
    
    findMatches(regex, text) {
        const matches = [];
        const global = regex.global;
        
        let match;
        const cloneRegex = new RegExp(regex.source, regex.flags);
        
        while ((match = cloneRegex.exec(text)) !== null) {
            matches.push({
                text: match[0],
                index: match.index,
                length: match[0].length,
                groups: match.groups || {},
                subgroups: match.slice(1)
            });
            
            // Prevent infinite loop on zero-width matches
            if (match[0].length === 0) {
                cloneRegex.lastIndex++;
            }
            
            if (!global) break;
        }
        
        return matches;
    },
    
    replaceText() {
        const pattern = this.elements.pattern.value;
        const flags = this.elements.flags.value;
        const testString = this.elements.testString.value;
        const replacement = this.elements.replaceInput.value;
        
        if (!pattern || !testString) {
            this.showToast('Pattern and test string required', 'error');
            return;
        }
        
        try {
            const regex = new RegExp(pattern, flags);
            const result = testString.replace(regex, replacement);
            
            this.elements.replaceResult.value = result;
            this.elements.copyReplaceBtn.style.display = 'inline-flex';
            
            // Show stats
            const replacementsMade = (testString.match(regex) || []).length;
            this.showToast(`Replaced ${replacementsMade} occurrence${replacementsMade !== 1 ? 's' : ''}`, 'success');
        } catch (e) {
            this.showError(e.message);
        }
    },
    
    copyReplaceResult() {
        const result = this.elements.replaceResult.value;
        navigator.clipboard.writeText(result).then(() => {
            this.showToast('Result copied to clipboard!', 'success');
        }).catch(() => {
            this.showToast('Failed to copy', 'error');
        });
    },
    
    displayResults(matches, text) {
        if (matches.length === 0) {
            this.elements.matches.innerHTML = '<div class="no-matches">❌ No matches found</div>';
            this.elements.matchStats.innerHTML = '';
            this.showResults(true);
            this.elements.replaceSection.style.display = 'block';
            return;
        }
        
        // Build highlighted text
        let highlightedText = '';
        let lastIndex = 0;
        
        matches.forEach((match, i) => {
            highlightedText += this.escapeHtml(text.slice(lastIndex, match.index));
            highlightedText += `<mark class="match-highlight" data-index="${i}">${this.escapeHtml(match.text)}</mark>`;
            lastIndex = match.index + match.length;
        });
        highlightedText += this.escapeHtml(text.slice(lastIndex));
        
        // Build match cards
        const matchCards = matches.map((match, i) => `
            <div class="match-card" data-index="${i}">
                <div class="match-number">#${i + 1}</div>
                <div class="match-text">"${this.escapeHtml(match.text)}"</div>
                <div class="match-info">
                    <span>Position: ${match.index}</span>
                    <span>Length: ${match.length}</span>
                </div>
                ${match.subgroups.length > 0 ? `
                    <div class="match-groups">
                        <strong>Groups:</strong>
                        ${match.subgroups.map((g, gi) => 
                            g !== undefined ? `<span class="group">$${gi + 1}: "${this.escapeHtml(g)}"</span>` : ''
                        ).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
        
        this.elements.matches.innerHTML = `
            <div class="highlighted-text">${highlightedText}</div>
            <div class="match-cards">${matchCards}</div>
        `;
        
        // Stats
        const totalLength = matches.reduce((sum, m) => sum + m.length, 0);
        this.elements.matchStats.innerHTML = `
            <div class="stat">
                <span class="stat-value">${matches.length}</span>
                <span class="stat-label">Matches</span>
            </div>
            <div class="stat">
                <span class="stat-value">${totalLength}</span>
                <span class="stat-label">Total Chars</span>
            </div>
            <div class="stat">
                <span class="stat-value">${((totalLength / text.length) * 100).toFixed(1)}%</span>
                <span class="stat-label">Coverage</span>
            </div>
        `;
        
        this.showResults(true);
        this.elements.replaceSection.style.display = 'block';
    },
    
    generateExplanation(pattern, flags, matches) {
        const explanations = [];
        
        // Pattern breakdown
        const parts = this.explainPattern(pattern);
        explanations.push({
            title: 'Pattern Breakdown',
            content: parts
        });
        
        // Flags explanation
        if (flags) {
            const flagExplanations = [];
            if (flags.includes('g')) flagExplanations.push('<code>g</code> - Global: Find all matches');
            if (flags.includes('i')) flagExplanations.push('<code>i</code> - Case-insensitive');
            if (flags.includes('m')) flagExplanations.push('<code>m</code> - Multiline: ^ and $ match line boundaries');
            if (flags.includes('s')) flagExplanations.push('<code>s</code> - Dotall: . matches newlines');
            if (flags.includes('u')) flagExplanations.push('<code>u</code> - Unicode: Full Unicode support');
            
            if (flagExplanations.length > 0) {
                explanations.push({
                    title: 'Flags',
                    content: `<ul>${flagExplanations.map(e => `<li>${e}</li>`).join('')}</ul>`
                });
            }
        }
        
        // Match summary
        if (matches.length > 0) {
            explanations.push({
                title: 'Match Summary',
                content: `Found <strong>${matches.length}</strong> match${matches.length !== 1 ? 'es' : ''} in the test string.`
            });
        }
        
        this.elements.explanation.innerHTML = explanations.map(exp => `
            <div class="explanation-block">
                <h4>${exp.title}</h4>
                <div class="explanation-content">${exp.content}</div>
            </div>
        `).join('');
        
        this.elements.explanationSection.style.display = 'block';
    },
    
    explainPattern(pattern) {
        const explanations = [];
        const chars = pattern.split('');
        
        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            const nextChar = chars[i + 1];
            
            if (char === '\\' && nextChar) {
                const escapeSeq = `\\${nextChar}`;
                const escapeExplanations = {
                    '\\d': 'Digit (0-9)',
                    '\\D': 'Non-digit',
                    '\\w': 'Word character (letter, digit, underscore)',
                    '\\W': 'Non-word character',
                    '\\s': 'Whitespace character',
                    '\\S': 'Non-whitespace character',
                    '\\n': 'Newline',
                    '\\t': 'Tab',
                    '\\r': 'Carriage return',
                    '\\b': 'Word boundary',
                    '\\B': 'Non-word boundary'
                };
                explanations.push(`<span class="pattern-part"><code>${this.escapeHtml(escapeSeq)}</code> - ${escapeExplanations[escapeSeq] || `Escape sequence: ${nextChar}`}</span>`);
                i++;
            } else if (char === '.') {
                explanations.push('<span class="pattern-part"><code>.</code> - Any character except newline</span>');
            } else if (char === '^') {
                explanations.push('<span class="pattern-part"><code>^</code> - Start of string/line</span>');
            } else if (char === '$') {
                explanations.push('<span class="pattern-part"><code>$</code> - End of string/line</span>');
            } else if (char === '+') {
                explanations.push('<span class="pattern-part"><code>+</code> - One or more of previous</span>');
            } else if (char === '*') {
                explanations.push('<span class="pattern-part"><code>*</code> - Zero or more of previous</span>');
            } else if (char === '?') {
                explanations.push('<span class="pattern-part"><code>?</code> - Zero or one of previous (optional)</span>');
            } else if (char === '|') {
                explanations.push('<span class="pattern-part"><code>|</code> - OR operator</span>');
            } else if (char === '(') {
                if (nextChar === '?') {
                    explanations.push('<span class="pattern-part"><code>(?</code> - Special group (lookahead/lookbehind)</span>');
                } else {
                    explanations.push('<span class="pattern-part"><code>(</code> - Start of capturing group</span>');
                }
            } else if (char === ')') {
                explanations.push('<span class="pattern-part"><code>)</code> - End of group</span>');
            } else if (char === '[') {
                explanations.push('<span class="pattern-part"><code>[</code> - Start of character class</span>');
            } else if (char === ']') {
                explanations.push('<span class="pattern-part"><code>]</code> - End of character class</span>');
            } else if (char === '{') {
                explanations.push('<span class="pattern-part"><code>{</code> - Start of quantifier</span>');
            } else if (char === '}') {
                explanations.push('<span class="pattern-part"><code>}</code> - End of quantifier</span>');
            } else {
                explanations.push(`<span class="pattern-part"><code>${this.escapeHtml(char)}</code> - Literal "${this.escapeHtml(char)}"</span>`);
            }
        }
        
        return `<div class="pattern-parts">${explanations.join('')}</div>`;
    },
    
    toggleFlag(tag) {
        const flag = tag.dataset.flag;
        const currentFlags = this.elements.flags.value;
        
        if (currentFlags.includes(flag)) {
            this.elements.flags.value = currentFlags.replace(flag, '');
            tag.classList.remove('active');
        } else {
            this.elements.flags.value = currentFlags + flag;
            tag.classList.add('active');
        }
        
        this.saveData();
        this.debounceTest();
    },
    
    updateFlagTags() {
        const currentFlags = this.elements.flags.value;
        this.elements.flagTags.forEach(tag => {
            const flag = tag.dataset.flag;
            if (currentFlags.includes(flag)) {
                tag.classList.add('active');
            } else {
                tag.classList.remove('active');
            }
        });
    },
    
    showResults(show) {
        this.elements.resultsSection.style.display = show ? 'block' : 'none';
    },
    
    showError(message) {
        this.elements.errorDisplay.innerHTML = `<strong>⚠️ Regex Error:</strong> ${this.escapeHtml(message)}`;
        this.elements.errorDisplay.style.display = 'block';
    },
    
    hideError() {
        this.elements.errorDisplay.style.display = 'none';
    },
    
    clearAll() {
        this.elements.pattern.value = '';
        this.elements.flags.value = 'g';
        this.elements.testString.value = '';
        this.elements.replaceInput.value = '';
        this.elements.replaceResult.value = '';
        this.elements.copyReplaceBtn.style.display = 'none';
        this.updateFlagTags();
        this.showResults(false);
        this.elements.explanationSection.style.display = 'none';
        this.elements.replaceSection.style.display = 'none';
        this.hideError();
        this.saveData();
    },
    
    copyPattern() {
        const pattern = this.elements.pattern.value;
        const flags = this.elements.flags.value;
        const fullPattern = `/${pattern}/${flags}`;
        
        navigator.clipboard.writeText(fullPattern).then(() => {
            this.showToast('Pattern copied to clipboard!', 'success');
        }).catch(() => {
            this.showToast('Failed to copy pattern', 'error');
        });
    },
    
    sharePattern() {
        const pattern = this.elements.pattern.value;
        const flags = this.elements.flags.value;
        const testString = this.elements.testString.value;
        
        if (!pattern) {
            this.showToast('Enter a pattern first', 'error');
            return;
        }
        
        // Build shareable URL
        const params = new URLSearchParams();
        params.set('pattern', encodeURIComponent(pattern));
        params.set('flags', flags);
        if (testString) params.set('text', encodeURIComponent(testString.substring(0, 500))); // Limit text length
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        
        navigator.clipboard.writeText(shareUrl).then(() => {
            this.showToast('Shareable URL copied!', 'success');
        }).catch(() => {
            // Fallback: show the URL
            prompt('Copy this URL to share:', shareUrl);
        });
    },
    
    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        const pattern = params.get('pattern');
        const flags = params.get('flags');
        const text = params.get('text');
        
        if (pattern) {
            this.elements.pattern.value = decodeURIComponent(pattern);
        }
        if (flags) {
            this.elements.flags.value = flags;
            this.updateFlagTags();
        }
        if (text) {
            this.elements.testString.value = decodeURIComponent(text);
        }
        
        // Auto-test if URL had pattern
        if (pattern && text) {
            setTimeout(() => this.testRegex(), 100);
        }
    },
    
    // Pattern History
    addToHistory(pattern, flags, description) {
        if (!pattern) return;
        
        // Check if already exists
        const exists = this.patternHistory.some(h => h.pattern === pattern && h.flags === flags);
        if (exists) return;
        
        const entry = {
            pattern,
            flags,
            description: description || 'Custom Pattern',
            timestamp: new Date().toISOString()
        };
        
        this.patternHistory.unshift(entry);
        
        // Keep only last 20
        if (this.patternHistory.length > 20) {
            this.patternHistory = this.patternHistory.slice(0, 20);
        }
        
        this.savePatternHistory();
        this.renderHistory();
    },
    
    loadPatternHistory() {
        try {
            const saved = localStorage.getItem('regex-tester-history');
            if (saved) {
                this.patternHistory = JSON.parse(saved);
                this.renderHistory();
            }
        } catch (e) {
            this.patternHistory = [];
        }
    },
    
    savePatternHistory() {
        try {
            localStorage.setItem('regex-tester-history', JSON.stringify(this.patternHistory));
        } catch (e) {
            // Ignore storage errors
        }
    },
    
    renderHistory() {
        if (!this.elements.historyList) return;
        
        if (this.patternHistory.length === 0) {
            this.elements.historyList.innerHTML = '<p class="history-empty">No history yet. Test some patterns to see them here!</p>';
            return;
        }
        
        this.elements.historyList.innerHTML = this.patternHistory.map((entry, i) => `
            <div class="history-item" data-index="${i}">
                <div class="history-pattern" title="/${entry.pattern}/${entry.flags}">
                    <code>/${this.truncate(entry.pattern, 25)}/${entry.flags}</code>
                </div>
                <div class="history-desc">${this.escapeHtml(entry.description)}</div>
                <div class="history-actions">
                    <button class="history-load" data-index="${i}" title="Load pattern">📋</button>
                    <button class="history-delete" data-index="${i}" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');
        
        // Bind history item events
        this.elements.historyList.querySelectorAll('.history-load').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                const entry = this.patternHistory[index];
                this.elements.pattern.value = entry.pattern;
                this.elements.flags.value = entry.flags;
                this.updateFlagTags();
                this.showToast('Pattern loaded from history', 'success');
            });
        });
        
        this.elements.historyList.querySelectorAll('.history-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.patternHistory.splice(index, 1);
                this.savePatternHistory();
                this.renderHistory();
            });
        });
    },
    
    toggleHistory() {
        const section = this.elements.historySection;
        if (section.style.display === 'none') {
            section.style.display = 'block';
            this.renderHistory();
        } else {
            section.style.display = 'none';
        }
    },
    
    clearHistory() {
        this.patternHistory = [];
        this.savePatternHistory();
        this.renderHistory();
    },
    
    truncate(str, max) {
        return str.length > max ? str.substring(0, max) + '...' : str;
    },
    
    saveData() {
        try {
            const data = {
                pattern: this.elements.pattern.value,
                flags: this.elements.flags.value,
                testString: this.elements.testString.value,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('regex-tester-data', JSON.stringify(data));
        } catch (e) {
            // Ignore storage errors
        }
    },
    
    loadSavedData() {
        try {
            const saved = localStorage.getItem('regex-tester-data');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.pattern) this.elements.pattern.value = data.pattern;
                if (data.flags) this.elements.flags.value = data.flags;
                if (data.testString) this.elements.testString.value = data.testString;
                this.updateFlagTags();
            }
        } catch (e) {
            // Ignore storage errors
        }
    },
    
    showToast(message, type = 'info') {
        // Remove existing toast
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(() => console.log('[SW] Registered'))
                .catch(err => console.log('[SW] Registration failed:', err));
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    RegexTester.init();
});
