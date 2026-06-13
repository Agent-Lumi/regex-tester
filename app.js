// Regex Tester - Real regex testing functionality
// v2.0 - Full rewrite with proper regex engine

const RegexTester = {
    // DOM Elements
    elements: {},
    
    // State
    currentMatches: [],
    matchIndex: 0,
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadSavedData();
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
            resultsSection: document.getElementById('resultsSection'),
            matches: document.getElementById('matches'),
            matchStats: document.getElementById('matchStats'),
            explanationSection: document.getElementById('explanationSection'),
            explanation: document.getElementById('explanation'),
            errorDisplay: document.getElementById('errorDisplay'),
            flagTags: document.querySelectorAll('.flag-tag'),
            patternButtons: document.querySelectorAll('.pattern-btn')
        };
    },
    
    bindEvents() {
        // Test button
        this.elements.testBtn?.addEventListener('click', () => this.testRegex());
        
        // Clear button
        this.elements.clearBtn?.addEventListener('click', () => this.clearAll());
        
        // Copy pattern button
        this.elements.copyPatternBtn?.addEventListener('click', () => this.copyPattern());
        
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
    
    displayResults(matches, text) {
        if (matches.length === 0) {
            this.elements.matches.innerHTML = '<div class="no-matches">❌ No matches found</div>';
            this.elements.matchStats.innerHTML = '';
            this.showResults(true);
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
                explanations.push(`<span class="pattern-part"><code>${escapeHtml(escapeSeq)}</code> - ${escapeExplanations[escapeSeq] || `Escape sequence: ${nextChar}`}</span>`);
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
                explanations.push(`<span class="pattern-part"><code>${escapeHtml(char)}</code> - Literal "${escapeHtml(char)}"</span>`);
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
    
    clearAll() {
        this.elements.pattern.value = '';
        this.elements.flags.value = 'g';
        this.elements.testString.value = '';
        this.showResults(false);
        this.hideError();
        this.updateFlagTags();
        localStorage.removeItem('regex-tester-data');
        this.showToast('Cleared all fields', 'info');
    },
    
    copyPattern() {
        const pattern = this.elements.pattern.value;
        const flags = this.elements.flags.value;
        
        if (!pattern) {
            this.showToast('No pattern to copy', 'error');
            return;
        }
        
        const fullPattern = `/${pattern}/${flags}`;
        navigator.clipboard.writeText(fullPattern).then(() => {
            this.showToast('Pattern copied to clipboard!', 'success');
        }).catch(() => {
            this.showToast('Failed to copy pattern', 'error');
        });
    },
    
    showResults(show) {
        this.elements.resultsSection.style.display = show ? 'block' : 'none';
        if (!show) {
            this.elements.explanationSection.style.display = 'none';
        }
    },
    
    showError(message) {
        this.elements.errorDisplay.innerHTML = `
            <div class="error-icon">⚠️</div>
            <div class="error-message">${escapeHtml(message)}</div>
        `;
        this.elements.errorDisplay.style.display = 'flex';
    },
    
    hideError() {
        this.elements.errorDisplay.style.display = 'none';
    },
    
    showToast(message, type = 'info') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    saveData() {
        const data = {
            pattern: this.elements.pattern.value,
            flags: this.elements.flags.value,
            testString: this.elements.testString.value,
            timestamp: Date.now()
        };
        localStorage.setItem('regex-tester-data', JSON.stringify(data));
    },
    
    loadSavedData() {
        const saved = localStorage.getItem('regex-tester-data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.elements.pattern.value = data.pattern || '';
                this.elements.flags.value = data.flags || 'g';
                this.elements.testString.value = data.testString || '';
                this.updateFlagTags();
                if (data.pattern && data.testString) {
                    this.testRegex();
                }
            } catch (e) {
                console.error('Failed to load saved data:', e);
            }
        }
    },
    
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(console.error);
        }
    },
    
    escapeHtml: escapeHtml
};

// Utility function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Old function signatures for backward compatibility
function process() {
    RegexTester.testRegex();
}

function copy() {
    RegexTester.copyPattern();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => RegexTester.init());
