// sounds.js - Sound Effects Manager
const SoundManager = {
    audioContext: null,
    sounds: {},
    
    init() {
        // Create AudioContext if supported
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log("🔊 AudioContext initialized");
        } catch (e) {
            console.warn("Web Audio API not supported");
            return;
        }
        
        this.createSounds();
    },
    
    createSounds() {
        // Correct answer sound (pleasant chime)
        this.sounds.correct = this.createBellSound(523.25, 0.3); // C5
        
        // Wrong answer sound (low buzz)
        this.sounds.incorrect = this.createBuzzSound(220, 0.2);
        
        // Button click sound
        this.sounds.click = this.createClickSound();
        
        // Level up sound (ascending arpeggio)
        this.sounds.levelUp = this.createArpeggioSound();
        
        // Time warning sound (beeping)
        this.sounds.timeWarning = this.createBeepSound();
        
        // Game over sound
        this.sounds.gameOver = this.createGameOverSound();
        
        // Hint sound
        this.sounds.hint = this.createHintSound();
        
        // Matrix calculation sound
        this.sounds.calculate = this.createCalculateSound();
    },
    
    createBellSound(frequency, duration) {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    },
    
    createBuzzSound(frequency, duration) {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    },
    
    createClickSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        };
    },
    
    createArpeggioSound() {
        return () => {
            const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            const times = [0, 0.2, 0.4, 0.6];
            
            frequencies.forEach((freq, i) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.value = freq;
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                    
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.5);
                }, times[i] * 1000);
            });
        };
    },
    
    createBeepSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            // Two quick beeps
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start();
            
            setTimeout(() => {
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + 0.15);
                gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);
            }, 150);
            
            oscillator.stop(this.audioContext.currentTime + 0.3);
        };
    },
    
    createGameOverSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = 440;
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(220, this.audioContext.currentTime + 1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 1);
        };
    },
    
    createHintSound() {
        return () => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = 392.00; // G4
            oscillator.type = 'triangle';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);
        };
    },
    
    createCalculateSound() {
        return () => {
            const frequencies = [261.63, 329.63, 392.00]; // C4, E4, G4
            const times = [0, 0.1, 0.2];
            
            frequencies.forEach((freq, i) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.value = freq;
                    oscillator.type = 'square';
                    
                    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                    
                    oscillator.start();
                    oscillator.stop(this.audioContext.currentTime + 0.1);
                }, times[i] * 1000);
            });
        };
    },
    
    play(soundName) {
        if (this.sounds[soundName] && this.audioContext) {
            try {
                this.sounds[soundName]();
            } catch (e) {
                console.warn("Could not play sound:", soundName, e);
            }
        }
    }
};

// Initialize sound manager on page load
document.addEventListener('DOMContentLoaded', () => {
    // User interaction required to start audio context
    document.body.addEventListener('click', () => {
        if (!SoundManager.audioContext) {
            SoundManager.init();
        }
    }, { once: true });
});