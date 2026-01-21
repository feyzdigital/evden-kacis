/**
 * BULMACA SİSTEMİ
 */

const PuzzleSystem = {
    currentPuzzle: null,
    
    open(puzzleId, solvedPuzzles) {
        const puzzle = PUZZLES[puzzleId];
        if (!puzzle) return false;
        
        // Zaten çözülmüş mü?
        if (solvedPuzzles.includes(puzzleId)) {
            UI.showMessage('Bu bulmacayı zaten çözdün!', 1500);
            return false;
        }
        
        this.currentPuzzle = puzzle;
        this.showPuzzleModal(puzzle);
        return true;
    },
    
    showPuzzleModal(puzzle) {
        Utils.$('puzzle-title').textContent = puzzle.title;
        Utils.$('puzzle-content').innerHTML = puzzle.content;
        Utils.$('puzzle-feedback').textContent = '';
        Utils.$('puzzle-hint').textContent = '';
        
        const interactiveArea = Utils.$('puzzle-interactive');
        interactiveArea.innerHTML = '';
        
        if (puzzle.type === 'riddle' || puzzle.type === 'code') {
            // Cevap giriş alanı
            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'puzzle-answer';
            input.placeholder = 'Cevabını yaz...';
            input.style.cssText = 'width:200px;padding:10px;font-size:18px;text-align:center;background:#1e293b;border:2px solid #334155;color:#e2e8f0;font-family:VT323,monospace;';
            
            const submitBtn = document.createElement('button');
            submitBtn.className = 'btn btn-primary';
            submitBtn.textContent = 'CEVAPLA';
            submitBtn.style.marginLeft = '10px';
            submitBtn.onclick = () => this.checkAnswer();
            
            const hintBtn = document.createElement('button');
            hintBtn.className = 'btn btn-secondary';
            hintBtn.textContent = 'İPUCU';
            hintBtn.style.marginLeft = '10px';
            hintBtn.onclick = () => this.showHint();
            
            interactiveArea.appendChild(input);
            interactiveArea.appendChild(submitBtn);
            interactiveArea.appendChild(hintBtn);
            
            // Enter ile cevaplama
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.checkAnswer();
            });
            
            // Focus
            setTimeout(() => input.focus(), 100);
            
        } else if (puzzle.type === 'observe') {
            // Sadece gözlem - kapat butonu yeterli
            const okBtn = document.createElement('button');
            okBtn.className = 'btn btn-primary';
            okBtn.textContent = 'ANLADIM';
            okBtn.onclick = () => Game.closePuzzle();
            interactiveArea.appendChild(okBtn);
        }
        
        Utils.$('puzzle-modal').classList.add('active');
    },
    
    checkAnswer() {
        if (!this.currentPuzzle) return;
        
        const input = Utils.$('puzzle-answer');
        const answer = input.value.trim().toLowerCase();
        const correctAnswer = this.currentPuzzle.answer.toLowerCase();
        
        if (answer === correctAnswer) {
            // Doğru cevap!
            Utils.$('puzzle-feedback').innerHTML = '<span style="color:#4ade80">✓ DOĞRU!</span>';
            
            // Ödülü ver
            this.giveReward(this.currentPuzzle);
            
            // Bulmacayı çözüldü olarak işaretle
            Game.markPuzzleSolved(this.currentPuzzle.id);
            RoomManager.markPuzzleSolved(this.currentPuzzle.id);
            
            // Modalı kapat
            setTimeout(() => Game.closePuzzle(), 1000);
            
        } else {
            // Yanlış cevap
            Utils.$('puzzle-feedback').innerHTML = '<span style="color:#ef4444">✗ Yanlış, tekrar dene!</span>';
            input.value = '';
            input.focus();
        }
    },
    
    giveReward(puzzle) {
        switch (puzzle.reward) {
            case 'clue':
                Game.addClue();
                UI.showMessage(`📜 ${puzzle.clueText}`, 3000);
                break;
            case 'key':
                Game.addKey('key-safe');
                UI.showMessage('🔑 Kasadan anahtar aldın!', 2000);
                break;
            case 'info':
                UI.showMessage('💡 Bu bilgiyi hatırla!', 2000);
                break;
        }
    },
    
    showHint() {
        if (this.currentPuzzle && this.currentPuzzle.hint) {
            Utils.$('puzzle-hint').textContent = '💡 ' + this.currentPuzzle.hint;
        }
    },
    
    close() {
        Utils.$('puzzle-modal').classList.remove('active');
        this.currentPuzzle = null;
    }
};
